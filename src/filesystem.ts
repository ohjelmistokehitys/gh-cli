import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Exercise, RepoMap, Student } from "./types.ts";

/**
 * Reads the students.json file for the given organization and returns an array of Student objects.
 */
export function loadStudents(org: string): Student[] {
    const dataFilePath = path.join(process.cwd(), org, `students.json`);
    return JSON.parse(readFileSync(dataFilePath, 'utf8').trim());
}

/**
 * Writes the given array of Student objects to the students.json file for the given organization.
 */
export function writeStudents(org: string, students: Student[]): void {
    const dataFilePath = path.join(process.cwd(), org, `students.json`);
    writeFileSync(dataFilePath, JSON.stringify(students, null, 4), 'utf8');
}

/**
 * Loads the repositories.json file for the given organization and returns a RepoMap object.
 */
export function loadRepositoriesFile(org: string): RepoMap {
    const dataFilePath = path.join(process.cwd(), org, `repos.json`);
    return JSON.parse(readFileSync(dataFilePath, 'utf8'));
}

/**
 * Writes the given RepoMap to the repositories.json file for the given organization.
 */
export function writeRepositoriesToFile(org: string, repos: RepoMap): void {
    const dataFilePath = path.join(process.cwd(), org, `repos.json`);
    writeFileSync(dataFilePath, JSON.stringify(repos, null, 4), 'utf8');
}

/**
 * Loads the exercises.json file for the given organization and returns an array of Exercise objects.
 */
export function loadExercises(org: string): Exercise[] {
    const dataFilePath = path.join(process.cwd(), org, `exercises.json`);
    return JSON.parse(readFileSync(dataFilePath, 'utf8').trim());
}

/**
 * Writes the given array of Exercise objects to the exercises.json file for the given organization.
 */
export function writeExercises(org: string, exercises: Exercise[]): void {
    const dataFilePath = path.join(process.cwd(), org, `exercises.json`);
    writeFileSync(dataFilePath, JSON.stringify(exercises, null, 4), 'utf8');
}

/**
 * Writes the given rows to a CSV file for the given organization. Each row is an array of
 * strings, and the first row is treated as the header.
 */
export function writeCsvReport(rows: string[][], org: string, file: string): void {
    const outputPath = path.join(process.cwd(), org, file);
    const csv = rows
        .map(row => row.map(escapeCsvValue))
        .map(row => row.join(","))
        .join("\n") + "\n";

    writeFileSync(outputPath, csv, "utf8");
}

/**
 * Utility function to escape a value for CSV output.
 */
const escapeCsvValue = (value: string | number | null | undefined): string => {
    return `"${String(value ?? "").replace(/"/g, '""')}"`;
};
