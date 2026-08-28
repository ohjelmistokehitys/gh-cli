import { getLatestWorkflowRun, getPoints, listRepositories } from './api.ts';
import { loadExercises, loadRepositoriesFile, writeRepositoriesToFile } from './filesystem.ts';

const org = "hh-devops-2026";

let repos = loadRepositoriesFile(org);
let exercises = loadExercises(org);

console.log(`Loaded ${Object.keys(repos).length} repositories for ${org} from file`);

const fetchedRepos = listRepositories(org);
console.log(`Fetched ${Object.keys(fetchedRepos).length} repositories from GitHub API`);

// Add new repositories and update existing ones based on the pushedAt timestamp
for (const [nameWithOwner, repo] of Object.entries(fetchedRepos)) {

    const exercise = exercises.find(ex => ex.repo === repo.parent?.name || ex.repo === repo.templateRepository?.name);

    if (!exercise) {
        console.warn(`No exercise matches for repository: ${nameWithOwner}`);
        continue;
    }

    repo.exercise = exercise;

    const existingRepo = repos[nameWithOwner];

    if (!existingRepo) {
        repos[nameWithOwner] = repo;
        continue;
    }

    // Compare pushedAt timestamps and update if the incoming repo is more recent
    const existingPushedAt = new Date(existingRepo.pushedAt);
    const incomingPushedAt = new Date(repo.pushedAt);

    if (incomingPushedAt > existingPushedAt) {
        repos[nameWithOwner] = repo;
    }
}

// get the repositories that require fetching the latest workflow runs
const reposNeedingWorkflowRuns = Object.entries(repos).filter(([nameWithOwner, repo]) => typeof repo.latestWorkflowRun === "undefined");
console.log(`Fetching latest workflow runs for ${reposNeedingWorkflowRuns.length} repositories`);

reposNeedingWorkflowRuns.forEach(([nameWithOwner, repo]) => {
    const latestWorkflowRun = getLatestWorkflowRun(nameWithOwner);

    // set to null to indicate run was fetched but not found, so we don't fetch it again next time:
    repo.latestWorkflowRun = latestWorkflowRun ?? null;

    if (!latestWorkflowRun) {
        console.warn(`No workflow run found for repository: ${nameWithOwner}`);
        return;
    }

    if (!["completed", "failure", "success"].includes(latestWorkflowRun.status)) {
        console.warn(`Invalid workflow run status for repository: ${nameWithOwner}, status: ${latestWorkflowRun.status}, ${latestWorkflowRun.url}`);
        return;
    }

    const points = getPoints(nameWithOwner, latestWorkflowRun.databaseId);
    if (!points) {
        console.warn(`No points found for repository: ${nameWithOwner}, workflow run ID: ${latestWorkflowRun.databaseId}, ${latestWorkflowRun.url}`);
        return;
    }
    repo.points = points;
});

writeRepositoriesToFile(repos, org);
console.log(`Written ${Object.keys(repos).length} repositories to file for ${org}`);
