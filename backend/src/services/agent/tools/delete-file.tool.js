import fs from "fs/promises";

import {
    resolveWorkspacePath,
} from "../workspace.service.js";

import {
    trackChangedFile,
} from "../agent.limits.js";

export const deleteFileTool = {
    definition: {
        type: "function",

        function: {
            name: "delete_file",

            description:
                "Delete a repository file.",

            parameters: {
                type: "object",

                properties: {
                    path: {
                        type: "string",
                    },
                },

                required: [
                    "path",
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

        await fs.rm(
            fullPath,
            {
                force: true,
            }
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

            action: "delete_file",

            path: args.path,
        };
    },
};