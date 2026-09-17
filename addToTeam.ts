import { addToTeam } from './src/api.ts';
import { loadStudents } from "./src/filesystem.ts";

const orgParam = process.argv[2];
const teamParam = process.argv[3];

if (!orgParam) {
    console.error("Missing organization argument.");
    process.exit(1);
}

if (!teamParam) {
    console.error("Missing team argument.");
    process.exit(1);
}


function main(org: string, team: string) {
    const students = loadStudents(org);

    for (const student of students) {
        console.log(student);
        addToTeam(org, team, student.github);
    }
}

main(orgParam, teamParam);
