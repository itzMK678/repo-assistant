import fs from "fs/promises";
import path from "path";

async function walk(
    directory,
    results
) {
    const entries =
        await fs.readdir(
            directory,
            {
                withFileTypes: true,
            }
        );

    for (const entry of entries) {
        if (
            [
                "node_modules",
                ".git",
                ".next",
                "dist",
                "build",
            ].includes(entry.name)
        ) {
            continue;
        }

        const fullPath =
            path.join(
                directory,
                entry.name
            );

        if (entry.isDirectory()) {
            await walk(
                fullPath,
                results
            );
        } else {
            results.push(fullPath);
        }
    }
}

export const findFileTool = {
    definition: {
        type: "function",

        function: {
            name: "find_file",

            description:
                "Find files by filename.",

            parameters: {
                type: "object",

                properties: {
                    name: {
                        type: "string",
                    },
                },

                required: [
                    "name",
                ],
            },
        },
    },

    async execute({
        arguments: args,
        context,
    }) {
        const files = [];

        await walk(
            context.workspacePath,
            files
        );

        const matches =
            files
                .filter((file) =>
                    path.basename(file)
                        .toLowerCase()
                        .includes(
                            args.name
                                .toLowerCase()
                        )
                )
                .slice(0, 100)
                .map((file) =>
                    path.relative(
                        context.workspacePath,
                        file
                    ).replaceAll(
                        "\\",
                        "/"
                    )
                );

        return {
            matches,
        };
    },
};