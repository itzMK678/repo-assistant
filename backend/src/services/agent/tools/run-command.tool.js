import {
    executeInExistingWorkspace,
} from "../../sandbox/sandbox.service.js";

import {
    incrementCommand,
} from "../agent.limits.js";

export const runCommandTool = {
    definition: {
        type: "function",

        function: {
            name: "run_command",

            description:
                "Run a shell command inside the isolated Docker sandbox.",

            parameters: {
                type: "object",

                properties: {
                    command: {
                        type: "string",
                    },
                },

                required: [
                    "command",
                ],
            },
        },
    },

    async execute({
        arguments: args,
        context,
        limits,
    }) {
        if (!args?.command) {
            throw new Error(
                "command is required"
            );
        }

        if (limits) {
            incrementCommand(limits);
        }

        const result = await executeInExistingWorkspace({
            workspacePath:
                context.workspacePath,

            command:
                args.command,
        });

        if (context?.commandResults) {
            context.commandResults.push({
                command: args.command,
                ...result,
            });
        }

        return result;
    },
};