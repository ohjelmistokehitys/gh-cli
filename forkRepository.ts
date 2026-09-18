import { addUserToRepo, forkRepository, listRepositories } from './src/api.ts';
import { readParams } from './src/cli.ts';
import { loadStudents } from './src/filesystem.ts';

const [orgParam, repoParam, forkPrefixParam] = readParams("organization", "repository", "forkPrefix");

/**
 * Forks a repository for each student in the organization. Skips forking if the repository already exists.
 * If the repository is successfully forked, it adds the student as a collaborator to their forked repository.
 */
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
