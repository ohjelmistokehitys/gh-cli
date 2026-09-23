import { getLatestWorkflowRun, getPoints, listCollaborators, listRepositories } from './src/api.ts';
import { readParams } from './src/cli.ts';
import { loadExercises, loadRepositoriesFile, loadStudents, writeRepositoriesToFile } from './src/filesystem.ts';
import type { Points, Repo, SubmissionMap, SubmissionRepo } from './src/types.ts';

const [orgParam] = readParams("organization");

/**
 * Fetches the latest information for each repository in the given organization.
 *
 * The function updates the local repositories file with the latest workflow runs and points for each repository.
 * Repositories that have not been updated since the last fetch are skipped, and repositories that do not match
 * any exercise are ignored with a warning.
 */
function main(org: string) {
    const repos = loadRepositoriesFile(org);
    const students = loadStudents(org);
    const exercises = loadExercises(org);

    const incomingRepos = listRepositories(org);

    console.log(`Loaded ${Object.keys(repos).length} repositories for ${org} from file`);
    console.log(`Fetched ${Object.keys(incomingRepos).length} repositories from GitHub API`);

    const updatedRepos = filterNewAndUpdatedRepositories(repos, incomingRepos);

    const newSubmissions = updatedRepos
        .map(repo => ({
            ...repo,
            // finds the exercise that is used as the template or parent for the repository (if any)
            exercise: exercises.find(ex => [repo.parent?.name, repo.templateRepository?.name].includes(ex.repo))
        }))
        .filter((repo): repo is Omit<SubmissionRepo, "studentUsername"> => {
            if (typeof repo.exercise === "undefined") {
                console.warn(`⚠️  No exercise matches repository: ${repo.nameWithOwner}`);
                return false;
            }
            return true;
        })
        .map(repo => {
            // finds the student that is associated with the repository based on the GitHub username in the repository name
            const usernameInRepo = students.map(s => s.github.toLowerCase()).find(username => repo.name.toLowerCase().endsWith(username));
            if (usernameInRepo) {
                return { ...repo, studentUsername: usernameInRepo };
            }

            // it the student username is not in the repository name, we check the collaborators of the repository to find a match
            const collaborators = listCollaborators(org, repo.name).map(c => c.toLowerCase());
            const student = students.find(s => collaborators.includes(s.github.toLowerCase()));
            if (student) {
                return { ...repo, studentUsername: student.github };
            }

            console.warn(`⚠️  No student found for repository: ${repo.nameWithOwner}`);
            return { ...repo, studentUsername: null };
        })
        .filter((repo): repo is SubmissionRepo => {
            if (repo.studentUsername === null) {
                console.warn(`⚠️  No student found for repository: ${repo.nameWithOwner}`);
                return false;
            }
            return true;
        });

    console.log(`Found ${newSubmissions.length} new or updated submissions`);
    console.log(`Skipped ${updatedRepos.length - newSubmissions.length} repositories that did not match any exercise or student`);

    // populate submissions with the workflow runs
    newSubmissions.forEach((repo, i) => {
        console.log(`${i + 1}/${newSubmissions.length} - ${repo.nameWithOwner}`);
        repo.latestWorkflowRun = getLatestWorkflowRun(repo);
    });

    newSubmissions.forEach(submission => {
        submission.points = fetchPoints(submission);
    });

    // merge the new submissions into the existing repositories, overwriting any existing entries with the same nameWithOwner
    Object.assign(repos, Object.fromEntries(newSubmissions.map(repo => [repo.nameWithOwner, repo])));

    writeRepositoriesToFile(org, repos);
    console.log(`Wrote ${Object.keys(repos).length} repositories to file for ${org}`);

}

main(orgParam);


/**
 * Compares the incoming repositories with a map of existing repositories and returns
 * only those that are new or have new commits that the existing repositories do not have.
 */
function filterNewAndUpdatedRepositories(existing: SubmissionMap, incoming: Repo[]) {
    return incoming
        .filter(repo => {
            // check if the repository already exists in the given map
            const existingRepo = existing[repo.nameWithOwner];

            // use the incoming repo if it is new or has a new push since the last time we checked
            return !existingRepo || repo.pushedAt !== existingRepo.pushedAt;
        });
}

/**
 * Fetches the points for a given repository and updates the repository object with the points.
 */
function fetchPoints(repo: SubmissionRepo): Points | undefined {
    if (!repo.latestWorkflowRun) {
        console.warn(`⚠️  No workflow run found for repository: ${repo.nameWithOwner}`);
        return;
    }

    if (!["completed", "failure", "success"].includes(repo.latestWorkflowRun.status)) {
        console.error(`❌  Invalid workflow run status for repository: ${repo.nameWithOwner}, status: ${repo.latestWorkflowRun.status}, ${repo.latestWorkflowRun.url}`);
        return;
    }

    const points = getPoints(repo.nameWithOwner, repo.latestWorkflowRun.databaseId);

    if (!points) {
        console.warn(`⚠️  No points found for repository: ${repo.nameWithOwner}, ${repo.latestWorkflowRun.url}`);
        return;
    }

    return points;
}

