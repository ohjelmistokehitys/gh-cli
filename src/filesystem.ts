import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Exercise, RepoMap, Student } from "./types.ts";

export function loadStudents(org: string): Student[] {
    const dataFilePath = path.join(process.cwd(), org, `students.json`);
    return JSON.parse(readFileSync(dataFilePath, 'utf8').trim());
}

export function loadRepositoriesFile(org: string): RepoMap {
    const dataFilePath = path.join(process.cwd(), org, `repos.json`);
    return JSON.parse(readFileSync(dataFilePath, 'utf8'));
}

export function writeRepositoriesToFile(repos: RepoMap, org: string): void {
    const dataFilePath = path.join(process.cwd(), org, `repos.json`);
    writeFileSync(dataFilePath, JSON.stringify(repos, null, 2), 'utf8');
}

export function loadExercises(org: string): Exercise[] {
    const dataFilePath = path.join(process.cwd(), org, `exercises.json`);
    return JSON.parse(readFileSync(dataFilePath, 'utf8').trim());
}

export function writeCsvReport(rows: string[][], org: string, file: string): void {
    const outputPath = path.join(process.cwd(), org, file);
    const csv = rows
        .map(row => row.map(escapeCsvValue))
        .map(row => row.join(","))
        .join("\n") + "\n";

    writeFileSync(outputPath, csv, "utf8");
}

const escapeCsvValue = (value: string | number | null | undefined): string => {
    return `"${String(value ?? "").replace(/"/g, '""')}"`;
};
