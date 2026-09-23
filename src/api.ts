import { $ } from 'zx';
import type { Collaborator, Points, Repo, SubmissionRepo, WorkflowRun } from "./types.ts";

/**
 * Lists all repositories in the given organization using the GitHub CLI. Returns an array of RepoDetails objects.
 */
export function listRepositories(org: string, limit = 1000): Repo[] {
    const { stdout } = $.sync`gh repo list ${org} --limit ${limit} --json name,nameWithOwner,pushedAt,templateRepository,parent`;
    return JSON.parse(stdout) as Repo[];
}

/**
 * Returns the latest workflow run for a given repository using the GitHub CLI. Returns null if no workflow run is found.
 *
 * Workflow run is determined primarily by the exercise's workflow file name, or defaults to 'classroom.yml' if not specified.
 */
export function getLatestWorkflowRun(repo: SubmissionRepo): WorkflowRun | null {
    try {
        const { stdout } = $.sync`gh run list --repo ${repo.nameWithOwner} --workflow ${repo.exercise?.workflow ?? 'classroom.yml'} --json workflowName,databaseId,createdAt,status,url --limit 1`;
        return JSON.parse(stdout)?.[0] as WorkflowRun;
    } catch (e) {
        console.error(e);
        return null;
    }
}

/**
 * Gets the plain text report of a workflow run and extracts the points from it. Returns null if the points are not found in the report.
 * Supports both the newer JSON format and the older plain text format in GitHub classroom reports.
 */
export function getPoints(repoWithOwner: string, databaseId: number): Points | null {
    const { stdout } = $.sync`gh run view ${databaseId} --repo ${repoWithOwner}`;


    const jsonMatch = stdout.match(/\{[^\n]*"totalPoints"\s*:\s*\d+[^\n]*"maxPoints"\s*:\s*\d+[^\n]*\}/i);
    if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as any;

        return {
            totalPoints: parsed.totalPoints,
            maxPoints: parsed.maxPoints,
        };
    }

    const match = stdout.match(/-\s*Points\s+(\d+)\s*\/\s*(\d+)/i);
    if (match) {
        return {
            totalPoints: Number(match[1]),
            maxPoints: Number(match[2]),
        };
    }

    // no points? possibly a skipped workflow run when the student didn't submit anything yet.
    return null;
}

/**
 * Adds a user to a team in an organization using the GitHub
 * CLI. Throws an error if the operation fails.
 */
export function addToTeam(org: string, team: string, user: string) {
    const { stderr, stdout } = $.sync`gh api --method PUT "orgs/${org}/teams/${team}/memberships/${user}"`;

    if (stderr) {
        console.error(stderr);
        throw new Error(`Failed to add user ${user} to team ${team} in organization ${org}`);
    }
}

/**
 * Adds a user as a collaborator to a repository in an organization using the GitHub
 * CLI. Throws an error if the operation fails.
 */
export function addUserToRepo(org: string, repo: string, user: string) {
    const { stderr, stdout } = $.sync`gh api --method PUT "repos/${org}/${repo}/collaborators/${user}"`;

    if (stderr) {
        console.error(stderr);
        throw new Error(`Failed to add user ${user} to repository ${repo} in organization ${org}`);
    }
}

/**
 * Forks a repository in a given organization using the GitHub CLI.
 * Throws an error if the operation fails.
 */
export function forkRepository(org: string, repo: string, forkName: string) {
    const { stderr, stdout } = $.sync`gh repo fork ${org}/${repo} --org ${org} --fork-name ${forkName} --clone=false`;

    if (stderr) {
        console.error(stderr);
        throw new Error(`Failed to fork repository ${org}/${repo} to ${org}/${forkName}`);
    }
}

/**
 * Lists the collaborators of a repository in a given organization using the GitHub CLI.
 * Returns an array of collaborator logins (usernames).
 */
export function listCollaborators(org: string, repo: string): string[] {
    const { stdout } = $.sync`gh api "repos/${org}/${repo}/collaborators"`;

    const response: Collaborator[] = JSON.parse(stdout);
    return response.map(c => c.login);
}
