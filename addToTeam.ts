import { addToTeam } from './src/api.ts';
import { readParams } from './src/cli.ts';
import { loadStudents } from "./src/filesystem.ts";

const [orgParam, teamParam] = readParams("organization", "team");

/**
 * Adds all students in the given organization to the specified team in that organization.
 *
 * Mainly useful for adding everyone write access to a shared repository, without adding them
 * as collaborators individually.
 */
function main(org: string, team: string) {
    const students = loadStudents(org);

    for (const student of students) {
        console.log(`Adding ${student.github} to team ${team}`);
        addToTeam(org, team, student.github);
    }
}

main(orgParam, teamParam);
