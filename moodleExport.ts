import { loadExercises, loadRepositoriesFile, loadStudents, writeCsvReport } from "./filesystem.ts";

const org = "hh-devops-2026";

const students = loadStudents(org);
const exercises = loadExercises(org);
const repositories = loadRepositoriesFile(org);

const exerciseNames = exercises.map((exercise) => exercise.name);
const rows: string[][] = [
    [
        "name", "email", ...exerciseNames.map(name => [`${name} (points)`, `${name} (feedback)`]).flat()
    ]
];

for (const student of students) {
    const row: string[] = [student.name, student.email];

    for (const exercise of exercises) {
        const repo = Object.values(repositories).find(candidate => {
            if (candidate.exercise?.name !== exercise.name) {
                return false;
            }

            return candidate.nameWithOwner.toLowerCase().endsWith(student.github.toLowerCase());
        });

        if (!repo) {
            row.push("0");
            row.push("No repository found");
            continue;
        }

        if (!repo.points) {
            row.push("0");
            row.push(repo.latestWorkflowRun?.url ?? "No workflow run URL available");
            continue;
        }

        const scaledPoints = 5 * repo.points.totalPoints / repo.points.maxPoints;
        row.push(`${scaledPoints}`);
        row.push(`${repo.points.totalPoints} / ${repo.points.maxPoints} => ${scaledPoints}. ${repo.latestWorkflowRun?.url ?? "No workflow run URL available"}`);
    }

    rows.push(row);
}

writeCsvReport(rows, org, "grading.csv");

console.table(rows);

