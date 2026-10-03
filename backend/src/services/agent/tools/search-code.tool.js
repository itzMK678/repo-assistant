import fs from "fs/promises";
import path from "path";

import {
    resolveWorkspacePath,
} from "../workspace.service.js";

async function collectFiles(
    directory,
    baseDirectory,
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
            await collectFiles(
                fullPath,
                baseDirectory,
                results
            );
        } else {
            results.push(fullPath);
        }
    }
}

export const searchCodeTool = {
    definition: {
        type: "function",

        function: {
            name: "search_code",

            description:
                "Search repository source code for a text pattern.",

            parameters: {
                type: "object",

                properties: {
                    query: {
                        type: "string",
                    },

                    path: {
                        type: "string",
                    },
                },

                required: [
                    "query",
                ],
            },
        },
    },

    async execute({
        arguments: args,
        context,
    }) {
        const root =
            resolveWorkspacePath(
                context.workspacePath,
                args?.path || ""
            );

        const files = [];

        await collectFiles(
            root,
            context.workspacePath,
            files
        );

        const results = [];

        for (const file of files) {
            if (
                results.length >= 100
            ) {
                break;
            }

            try {
                const content =
                    await fs.readFile(
                        file,
                        "utf8"
                    );

                if (
                    content.includes(
                        args.query
                    )
                ) {
                    results.push({
                        path:
                            path.relative(
                                context.workspacePath,
                                file
                            ).replaceAll(
                                "\\",
                                "/"
                            ),
                    });
                }
            } catch {
                // Ignore binary/unreadable files.
            }
        }

        return {
            query: args.query,
            matches: results,
        };
    },
};