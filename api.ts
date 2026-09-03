import { $ } from 'zx';
import type { Points, RepoDetails, RepoMap, WorkflowRun } from "./types.ts";


export function listRepositories(org: string): RepoMap {
    const { stdout } = $.sync`gh repo list ${org} --limit 1000 --json nameWithOwner,pushedAt,templateRepository,parent`;
    const result = JSON.parse(stdout) as RepoDetails[];

    return result.reduce((acc, curr) => {
        acc[curr.nameWithOwner] = curr;
        return acc;
    }, {} as RepoMap);
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

        if (typeof parsed.totalPoints === 'number' && typeof parsed.maxPoints === 'number') {
            return {
                totalPoints: parsed.totalPoints,
                maxPoints: parsed.maxPoints,
            };
        }
    }

    const match = stdout.match(/-\s*Points\s+(\d+)\s*\/\s*(\d+)/i);

    if (!match) {
        return null;
    }

    return {
        totalPoints: Number(match[1]),
        maxPoints: Number(match[2]),
    };
}
