import fs from "fs/promises";
import path from "path";

import {
    resolveWorkspacePath,
} from "../workspace.service.js";

async function walk(
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
            entry.name === "node_modules" ||
            entry.name === ".git" ||
            entry.name === ".next" ||
            entry.name === "dist" ||
            entry.name === "build"
        ) {
            continue;
        }

        const fullPath =
            path.join(
                directory,
                entry.name
            );

        const relativePath =
            path.relative(
                baseDirectory,
                fullPath
            );

        if (entry.isDirectory()) {
            await walk(
                fullPath,
                baseDirectory,
                results
            );
        } else {
            results.push(
                relativePath
                    .replaceAll("\\", "/")
            );
        }
    }
}

export const listFilesTool = {
    definition: {
        type: "function",

        function: {
            name: "list_files",

            description:
                "List repository files. Use this to understand the repository structure.",

            parameters: {
                type: "object",

                properties: {
                    path: {
                        type: "string",
                        description:
                            "Optional directory path.",
                    },
                },

                required: [],
            },
        },
    },

    async execute({
        arguments: args,
        context,
    }) {
        const requestedPath =
            args?.path || "";

        const directory =
            resolveWorkspacePath(
                context.workspacePath,
                requestedPath
            );

        const results = [];

        await walk(
            directory,
            context.workspacePath,
            results
        );

        return {
            files: results.slice(
                0,
                500
            ),
        };
    },
};
