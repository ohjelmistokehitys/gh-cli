import * as fs from "fs";
import * as path from "path";
import { listRepositories } from "./src/api.ts";
import { readParams } from "./src/cli.ts";
import { writeExercises, writeRepositoriesToFile as writeRepositories, writeStudents } from "./src/filesystem.ts";
import type { Exercise, RepoMap, Student } from "./src/types.ts";

const [orgParam] = readParams("organization");

/**
 * Initializes a local organization folder with the necessary files for managing exercises, repositories, and students.
 * The folder must not already exist, and the organization must be accessible via the GitHub API.
 */
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

    const exercises: Exercise[] = [{ name: "example-exercise", repo: "example-repo", workflow: "example-workflow.yml" }];
    writeExercises(orgName, exercises);

    const repositories = {} as RepoMap;
    writeRepositories(orgName, repositories);

    const students: Student[] = [{ email: "student@example.com", github: "student-github", name: "Student Name" }];
    writeStudents(orgName, students);
}

init(orgParam);
