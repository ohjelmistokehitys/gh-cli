export type Repo = {
    name: string;
    nameWithOwner: string;
    pushedAt: string;
    templateRepository: { name: string } | null;
    parent: { name: string } | null;
};

export type SubmissionRepo = Repo & {
    exercise: Exercise;
    studentUsername: string;
    latestWorkflowRun?: WorkflowRun | null;
    points?: Points;
};

export type RepoMap = Record<string, Repo>;
export type SubmissionMap = Record<string, SubmissionRepo>;

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
    /** Human readable name for this repository */
    name: string;
    /** The name of the repository that this exercise is either forked or created from */
    repo: string;
    /** The name of the owner of the source repository */
    owner: string;
    /** Name of the .yml file containing the autograding workflow */
    workflow?: string;
};

export type Student = {
    name: string;
    email: string;
    github: string;
};

export type Collaborator = {
    "login": string,
    "permissions": {
        "admin": boolean,
        "maintain": boolean,
        "push": boolean,
        "triage": boolean,
        "pull": boolean
    },
    "role_name": string
}
