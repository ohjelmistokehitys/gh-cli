import { readParams } from "./src/cli.ts";
import { loadExercises, loadRepositoriesFile, loadStudents, writeCsvReport } from "./src/filesystem.ts";
import type { RepoDetails, RepoMap, Student } from "./src/types.ts";

const [orgParam] = readParams("organization");

/**
 * Reads the students, exercises, and repositories for the given organization, and generates a CSV report with the grading information.
 * Grades are scaled to a maximum of 5 points, and feedback with a link to the latest workflow run is provided for each exercise.
 */
function main(org: string) {
    const students = loadStudents(org);
    const exercises = loadExercises(org);
    const allRepositories = loadRepositoriesFile(org);

    const rows: string[][] = [
        // builds a header row with student information and exercise points/feedback columns for all exercises
        ["name", "email", "github", ...exercises.map(ex => [`${ex.name} (points)`, `${ex.name} (feedback)`]).flat()]
    ];

    const studentSubmissions = mapReposToStudents(students, allRepositories);

    for (const student of students) {
        const row: string[] = [student.name, student.email, student.github];

        // all submissions for this student
        const submissions = studentSubmissions[student.github.toLowerCase()];

        // loop through course exercises and push them to the csv row
        for (const exercise of exercises) {
            const submission = submissions.find(repo => repo.exercise?.name === exercise.name);

            if (!submission) {
                row.push("0");
                row.push("No repository found");
                continue;
            }

            if (!submission.latestWorkflowRun) {
                row.push("0");
                row.push("No submission found");
                continue;
            }

            if (!submission.points) {
                row.push("0");
                row.push(`No points available. See ${submission.latestWorkflowRun.url}`);
                continue;
            }

            const scaleMax = 5;
            const scaledPoints = (scaleMax * (submission.points.totalPoints / submission.points.maxPoints)).toFixed(2);

            row.push(scaledPoints);
            row.push(`${submission.points.totalPoints} / ${submission.points.maxPoints} => ${scaledPoints} / ${scaleMax}. See ${submission.latestWorkflowRun.url}`);
        }

        rows.push(row);
    }

    writeCsvReport(rows, org, "grading.csv");

    console.table(rows);
}

main(orgParam);

/**
 * Returns a mapping of student GitHub usernames to their corresponding repositories.
 * If a repository does not match any student, a warning is logged to the console.
 */
function mapReposToStudents(students: Student[], repositories: RepoMap): Record<string, RepoDetails[]> {
    // initialize an empty array for each student to hold their repositories
    const studentRepositories = students.reduce((acc, student) => ({
        ...acc,
        [student.github.toLowerCase()]: []
    }), {} as Record<string, RepoDetails[]>);

    // Iterate through all repositories and assign them to students based on the username and repo name.
    // Repositories are iterated instead of students to detect and log repositories that do not match any student.
    for (const repo of Object.values(repositories)) {
        const student = students.find(student => repo.nameWithOwner.toLowerCase().endsWith(student.github.toLowerCase()));
        if (student) {
            studentRepositories[student.github.toLowerCase()].push(repo);
        } else {
            console.warn(`⚠️ No student matches repository: ${repo.nameWithOwner}`);
        }
    }

    return studentRepositories;
}

