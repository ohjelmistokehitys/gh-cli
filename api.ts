import { $ } from 'zx';
import type { Points, RepoDetails, WorkflowRun } from "./types.ts";


export function listRepositories(org: string): RepoDetails[] {
    const { stdout } = $.sync`gh repo list ${org} --limit 1000 --json nameWithOwner,pushedAt,templateRepository,parent`;
    return JSON.parse(stdout) as RepoDetails[];
}

export function getLatestWorkflowRun(repo: RepoDetails): WorkflowRun | undefined {
    try {
        const { stdout } = $.sync`gh run list --repo ${repo.nameWithOwner} --workflow ${repo.exercise?.workflow ?? 'classroom.yml'} --json workflowName,databaseId,createdAt,status,url --limit 1`;
        return JSON.parse(stdout)?.[0] as WorkflowRun;
    } catch (e) {
        console.error(e);
        return undefined;
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

    // no points? possibly a skipped workflow run when the student didn't yet submit anything.
    return null;
}
