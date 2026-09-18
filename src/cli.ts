
/**
 * Reads command line parameters and validates their presence. If the required parameters are not provided,
 * it displays a usage message and exits the process.
 *
 * If the "--help" or "-h" flag is provided, it displays a usage message and exits the process.
 */
export function readParams(...paramNames: string[]): string[] {
    const help = `Usage: node ${process.argv[1].split("/").pop()} ${paramNames.map(n => `<${n}>`).join(" ")}`;

    // omit the first two arguments (node and script path)
    const args = process.argv.slice(2);

    if (args.includes("--help") || args.includes("-h")) {
        console.log(help);
        process.exit(0);
    }

    if (args.length !== paramNames.length) {
        console.error(`Invalid number of arguments. Expected ${paramNames.length}, got ${args.length}.`);
        console.error(help);
        process.exit(1);
    }

    return paramNames.map((name, index) => {
        const userInput = args[index];
        if (!userInput) {
            console.error(`Missing parameter: ${name}`);
            console.error(help);
            process.exit(1);
        }
        return userInput;
    });
}
