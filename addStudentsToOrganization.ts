import { addToOrganization, listOrganizationMembers, listPendingInvitations } from './src/api.ts';
import { readParams } from './src/cli.ts';
import { loadStudents } from "./src/filesystem.ts";

const [orgParam] = readParams("organization");

/**
 * Reads the students from the local file system and adds any new students to the given organization.
 * A student is considered new if they are not already a member of the organization and do not have a pending invitation.
 */
function main(org: string) {
    const students = loadStudents(org);

    const members = listOrganizationMembers(org).map(m => m.toLowerCase());
    const invitations = listPendingInvitations(org).map(i => i.toLowerCase());

    const newStudents = students
        .filter(s => ![...members, ...invitations].includes(s.github.toLowerCase()));

    console.log(`Existing members: ${members.join(', ')}`);
    console.log(`Pending invitations: ${invitations.join(', ') || 0}`);
    console.log(`New students to add: ${newStudents.map(s => s.github).join(', ') || 0}`);
    console.log();

    newStudents.forEach(student => {
        console.log(`Adding ${student.github}`);
        addToOrganization(org, student.github);
    });
}

main(orgParam);
