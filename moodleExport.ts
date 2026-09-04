import { loadExercises, loadRepositoriesFile, loadStudents, writeCsvReport } from "./filesystem.ts";
import type { RepoDetails } from "./types.ts";

const orgParam = process.argv[2];

if (orgParam) {
    main(orgParam);
} else {
    console.error("Missing organization argument.");
    process.exit(1);
}

function main(org: string) {
    const students = loadStudents(org);
    const exercises = loadExercises(org);
    const repositories = loadRepositoriesFile(org);

    const exerciseNames = exercises.map(ex => ex.name);
    const rows: string[][] = [
        [
            "name", "email", "github", ...exerciseNames.map(name => [`${name} (points)`, `${name} (feedback)`]).flat()
        ]
    ];

    const studentRepositories = students.reduce((acc, student) => ({
        ...acc,
        [student.github.toLowerCase()]: []
    }), {} as Record<string, RepoDetails[]>);

    Object.values(repositories).forEach(repo => {
        const student = Object.keys(studentRepositories).find(username => repo.nameWithOwner.toLowerCase().endsWith(username));
        if (!student) {
            console.warn(`⚠️ No student matches repository: ${repo.nameWithOwner}`);
            return;
        }
        studentRepositories[student].push(repo);
    });

    for (const student of students) {
        const row: string[] = [student.name, student.email, student.github];

        for (const exercise of exercises) {
            const repo = studentRepositories[student.github.toLowerCase()].find(repo => repo.exercise?.name === exercise.name);

            if (!repo) {
                row.push("0");
                row.push("No repository found");
                continue;
            }

            if (!repo.latestWorkflowRun) {
                row.push("0");
                row.push("No submission found");
                continue;
            }

            if (!repo.points) {
                row.push("0");
                row.push("No points available");
                continue;
            }

            const scaledPoints = 5 * repo.points.totalPoints / repo.points.maxPoints;
            row.push(`${scaledPoints}`);
            row.push(`${repo.points.totalPoints} / ${repo.points.maxPoints} => ${scaledPoints}. ${repo.latestWorkflowRun.url}`);
        }

        rows.push(row);
    }

    writeCsvReport(rows, org, "grading.csv");

    console.table(rows);

}


