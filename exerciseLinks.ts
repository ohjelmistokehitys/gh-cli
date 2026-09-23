import { readParams } from "./src/cli.ts";
import { loadExercises } from "./src/filesystem.ts";

const [orgParam] = readParams("organization");

/**
 * Prints out a markdown list of exercises for the given organization, along with links to create new repositories from the exercise templates.
 */
function generateExerciseLinks(orgName: string) {
    const exercises = loadExercises(orgName);

    console.log(`# Exercises for ${orgName}:\n`)

    exercises.forEach((exercise, i) => {
        const params = {
            // template that contains the exercise and autograding
            template_name: exercise.repo,
            template_owner: exercise.owner,

            // information related to the new repository that will be created from the template
            owner: orgName,
            name: `${i + 1}-${exercise.repo}_YOUR_USERNAME`,
            visibility: "private"
        };

        const url = `https://github.com/new?${new URLSearchParams(params)}`;

        console.log(`${i + 1}. ${exercise.name}`);
        console.log(`  ${url}`);
        console.log();

    });
}

generateExerciseLinks(orgParam);
