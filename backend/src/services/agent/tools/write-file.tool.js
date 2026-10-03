import {
    writeWorkspaceFile,
} from "../workspace.service.js";

import {
    trackChangedFile,
} from "../agent.limits.js";

export const writeFileTool = {
    definition: {
        type: "function",

        function: {
            name: "write_file",

            description:
                "Modify an existing repository file with complete new content.",

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
        await writeWorkspaceFile({
            workspacePath:
                context.workspacePath,

            filePath:
                args.path,

            content:
                args.content,
        });

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

            action: "write_file",

            path: args.path,
        };
    },
};