# GitHub course management helpers

This repository contains a small set of TypeScript utilities for managing a GitHub organization used for course assignments and student repositories.

It is intended to help with tasks such as:

- creating a local organization workspace
- listing repositories for an org
- tracking exercises and students
- syncing repository metadata into JSON files
- exporting grading data for Moodle or similar systems
- adding users to teams and repositories

## Requirements

Before using the scripts, make sure you have:

- Node.js installed
- GitHub CLI installed and authenticated with `gh auth login`
- access to the target GitHub organization

## Quick start

From the project root:

```bash
node init.ts <organization-name>
```

This creates a folder named after the organization and initializes JSON files for:

- `exercises.json`
- `repos.json`
- `students.json`

The script validates that the organization exists and that the target folder does not already exist.

## Project structure

```text
.
├── init.ts
├── addToTeam.ts
├── fetchRepositories.ts
├── forkRepository.ts
├── moodleExport.ts
├── src/
│   ├── api.ts
│   ├── cli.ts
│   ├── filesystem.ts
│   └── types.ts
├── _data/
├── <organization>/
│   ├── exercises.json
│   ├── repos.json
│   ├── students.json
│   └── grading.csv
└── package.json
```

## Typical workflow

1. Initialize an organization workspace:
   `node init.ts my-org`
2. Update the generated JSON files with exercises and students.
3. Use the helper scripts to fetch repository data, add users to teams, fork repos, or export grades. If necessary, add the `--help` flag to see usage information for each script:
    `node fetchRepositories.ts --help`
4. Review generated reports such as CSV exports for grading and import into Moodle.

## Notes

This project is a lightweight automation toolkit rather than a full application framework. It relies on the GitHub CLI and local JSON state files to manage classroom data.

If you want to use a script directly, check the file names and arguments in the individual TypeScript entry points before running them.
