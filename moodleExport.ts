import { readParams } from "./src/cli.ts";
import { loadExercises, loadRepositoriesFile, loadStudents, writeCsvReport } from "./src/filesystem.ts";
import type { RepoDetails } from "./src/types.ts";

const [orgParam] = readParams("organization");

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
        const student = Object.keys(studentRepositories).find(username => repo.nameWithOwner.toLowerCase().endsWith(username.toLowerCase()));
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
                row.push(`No points available. See ${repo.latestWorkflowRun.url}`);
                continue;
            }

            const scaleMax = 5;
            const scaledPoints = scaleMax * (repo.points.totalPoints / repo.points.maxPoints);
            row.push(`${scaledPoints}`);
            row.push(`${repo.points.totalPoints} / ${repo.points.maxPoints} => ${scaledPoints} / ${scaleMax}. See ${repo.latestWorkflowRun.url}`);
        }

        rows.push(row);
    }

    writeCsvReport(rows, org, "grading.csv");

    console.table(rows);
}


main(orgParam);
