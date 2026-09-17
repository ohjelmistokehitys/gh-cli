import { addUserToRepo, forkRepository, listRepositories } from './src/api.ts';
import { loadStudents } from './src/filesystem.ts';

const orgParam = process.argv[2];
const repoParam = process.argv[3];
const forkPrefixParam = process.argv[4];

if (!orgParam) {
    console.error("Missing organization argument.");
    process.exit(1);
}

if (!repoParam) {
    console.error("Missing repository argument.");
    process.exit(1);
}

if (!forkPrefixParam) {
    console.error("Missing fork prefix argument.");
    process.exit(1);
}

function main(org: string, repo: string, forkPrefix: string) {
    const students = loadStudents(org);
    const existingRepos = listRepositories(org);

    for (const student of students) {
        const forkName = `${forkPrefix}_${student.github}`.toLowerCase();

        if (existingRepos.some(repo => repo.name.toLowerCase() === forkName)) {
            console.log(`Repository ${forkName} already exists, skipping fork for user ${student.github}`);
            continue;
        }

        forkRepository(org, repo, forkName, student.github);
        addUserToRepo(org, forkName, student.github);
    }
}

main(orgParam, repoParam, forkPrefixParam);
