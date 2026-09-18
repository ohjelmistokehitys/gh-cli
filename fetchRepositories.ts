import { getLatestWorkflowRun, getPoints, listRepositories } from './src/api.ts';
import { readParams } from './src/cli.ts';
import { loadExercises, loadRepositoriesFile, writeRepositoriesToFile } from './src/filesystem.ts';

const [orgParam] = readParams("organization");

/**
 * Fetches the latest information for each repository in the given organization.
 *
 * The function updates the local repositories file with the latest workflow runs and points for each repository.
 * Repositories that have not been updated since the last fetch are skipped, and repositories that do not match
 * any exercise are ignored with a warning.
 */
function main(org: string) {
    let repos = loadRepositoriesFile(org);
    console.log(`Loaded ${Object.keys(repos).length} repositories for ${org} from file`);

    const incomingRepos = listRepositories(org);
    console.log(`Fetched ${Object.keys(incomingRepos).length} repositories from GitHub API`);

    let exercises = loadExercises(org);

    incomingRepos
        .filter((repo) => {
            // finds the exercise that is used as the template or parent for the repository
            const exercise = exercises.find(ex => ex.repo === repo.parent?.name || ex.repo === repo.templateRepository?.name);

            if (!exercise) {
                // possibly a template repository, course website or non-exercise repo, so we skip it
                console.warn(`⚠️ No exercise matches repository: ${repo.nameWithOwner}`);
                return false;
            }

            repo.exercise = exercise;
            return true;
        })
        .forEach(repo => {
            // check if the repository already exists in the local file
            const existingRepo = repos[repo.nameWithOwner];

            // use the incoming repo if it is new or has a new push since the last time we checked
            if (!existingRepo || repo.pushedAt !== existingRepo.pushedAt) {
                repos[repo.nameWithOwner] = repo;
            }
        });

    // get the repositories that require fetching the latest workflow runs
    const reposNeedingUpdates = Object.values(repos)
        .filter((repo) => typeof repo.latestWorkflowRun === "undefined");

    console.log(`Fetching latest workflow runs for ${reposNeedingUpdates.length} repositories`);

    reposNeedingUpdates.forEach(repo => {
        console.log(`Fetching ${repo.nameWithOwner}`);

        // set to null to indicate run was fetched but not found, so we don't fetch it again next time:
        repo.latestWorkflowRun = getLatestWorkflowRun(repo);

        if (!repo.latestWorkflowRun) {
            console.warn(`⚠️ No workflow run found for repository: ${repo.nameWithOwner}`);
            // set to null to indicate it was fetched but not found, so we don't fetch it again next time
            repo.latestWorkflowRun = null;
            return;
        }

        if (!["completed", "failure", "success"].includes(repo.latestWorkflowRun.status)) {
            console.warn(`⚠️ Invalid workflow run status for repository: ${repo.nameWithOwner}, status: ${repo.latestWorkflowRun.status}, ${repo.latestWorkflowRun.url}`);
            delete repo.latestWorkflowRun;
            return;
        }

        const points = getPoints(repo.nameWithOwner, repo.latestWorkflowRun.databaseId);

        if (!points) {
            console.warn(`⚠️ No points found for repository: ${repo.nameWithOwner}, ${repo.latestWorkflowRun.url}`);
            return;
        }
        repo.points = points;
    });

    writeRepositoriesToFile(org, repos);
    console.log(`Written ${Object.keys(repos).length} repositories to file for ${org}`);

}

main(orgParam);
