import fs from "fs/promises";
import path from "path";

import {
    resolveWorkspacePath,
} from "../workspace.service.js";

import {
    trackChangedFile,
} from "../agent.limits.js";

export const createFileTool = {
    definition: {
        type: "function",

        function: {
            name: "create_file",

            description:
                "Create a new repository file.",

            parameters: {
                type: "object",

                properties: {
                    path: {
                        type: "string",
                    },

                    content: {
                        type: "string",
                    },
                },

                required: [
                    "path",
                    "content",
                ],
            },
        },
    },

    async execute({
        arguments: args,
        context,
        limits,
    }) {
        const fullPath =
            resolveWorkspacePath(
                context.workspacePath,
                args.path
            );

        try {
            await fs.access(fullPath);

            throw new Error(
                `File already exists: ${args.path}`
            );
        } catch (error) {
            if (
                error.code !== "ENOENT"
            ) {
                throw error;
            }
        }

        await fs.mkdir(
            path.dirname(fullPath),
            {
                recursive: true,
            }
        );

        await fs.writeFile(
            fullPath,
            args.content,
            "utf8"
        );

        if (limits) {
            trackChangedFile(
                limits,
                args.path
            );
        }

        if (context?.filesChanged) {
            context.filesChanged.add(
                args.path
            );
        }

        return {
            success: true,
            action: "create_file",
            path: args.path,
        };
    },
};