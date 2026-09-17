
export function readParams(...paramNames: string[]): string[] {
    // omit the first two arguments (node and script path)
    const argv = process.argv.slice(2);

    return paramNames.map((name, index) => {
        const userInput = argv[index];
        if (!userInput) {
            console.error(`Missing parameter: ${name}`);
            process.exit(1);
        }
        return userInput;
    });
}
