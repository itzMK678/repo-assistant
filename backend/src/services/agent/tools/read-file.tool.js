import fs from "fs/promises";

import {
    resolveWorkspacePath,
} from "../workspace.service.js";

export const readFileTool = {
    definition: {
        type: "function",

        function: {
            name: "read_file",

            description:
                "Read a repository file. Use this when you need to inspect implementation details.",

            parameters: {
                type: "object",

                properties: {
                    path: {
                        type: "string",
                    },

                    startLine: {
                        type: "number",
                    },

                    endLine: {
                        type: "number",
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
    }) {
        const fullPath =
            resolveWorkspacePath(
                context.workspacePath,
                args.path
            );

        const content =
            await fs.readFile(
                fullPath,
                "utf8"
            );

        const lines =
            content.split("\n");

        const start =
            args.startLine
                ? Math.max(
                    args.startLine - 1,
                    0
                )
                : 0;

        const end =
            args.endLine
                ? Math.min(
                    args.endLine,
                    lines.length
                )
                : lines.length;

        if (context?.filesRead) {
            context.filesRead.add(args.path);
        }

        return {
            path: args.path,

            content:
                lines
                    .slice(start, end)
                    .join("\n"),

            startLine:
                start + 1,

            endLine:
                end,

            totalLines:
                lines.length,
        };
    },
};