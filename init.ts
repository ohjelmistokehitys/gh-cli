import * as fs from "fs";
import * as path from "path";
import { listRepositories } from "./src/api.ts";
import { readParams } from "./src/cli.ts";

const [orgParam] = readParams("organization");

function init(orgName: string) {
    const orgPath = path.resolve(process.cwd(), orgName);

    if (fs.existsSync(orgPath)) {
        throw new Error(`A folder named "${orgName}" already exists.`);
    }

    try {
        listRepositories(orgName);
    } catch (error) {
        throw new Error(
            `Could not fetch repositories for organization "${orgName}". Make sure the organization exists and you have read access.`
        );
    }

    fs.mkdirSync(orgPath);

    fs.writeFileSync(path.join(orgPath, "exercises.json"), JSON.stringify([]));
    fs.writeFileSync(path.join(orgPath, "repos.json"), JSON.stringify([]));
    fs.writeFileSync(path.join(orgPath, "students.json"), JSON.stringify({}));
}

init(orgParam);
