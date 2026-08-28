export type RepoDetails = {
    nameWithOwner: string;
    pushedAt: string;
    templateRepository: { name: string } | null;
    parent: { name: string } | null;
    latestWorkflowRun?: WorkflowRun | null;
    points?: Points;
    exercise?: Exercise;
};

export type RepoMap = Record<string, RepoDetails>;

// https://docs.github.com/en/rest/actions/workflow-runs?apiVersion=2026-03-10#list-workflow-runs-for-a-repository--parameters
export type WorkflowRun = {
    workflowName: string;
    databaseId: number;
    createdAt: string;
    status: "completed" | "action_required" | "cancelled" | "failure" | "neutral" | "skipped" | "stale" | "success" | "timed_out" | "in_progress" | "queued" | "requested" | "waiting" | "pending"
    url: string;
}

export type Points = {
    totalPoints: number;
    maxPoints: number;
};

export type Exercise = {
    name: string;
    // The name of the repository that this exercise is either forked or created from
    repo: string;
};
