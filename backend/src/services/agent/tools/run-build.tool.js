import {
    executeInExistingWorkspace,
} from "../../sandbox/sandbox.service.js";

import {
    incrementCommand,
} from "../agent.limits.js";

export const runBuildTool = {
    definition: {
        type: "function",

        function: {
            name: "run_build",

            description:
                "Run the project's build command inside the Docker sandbox.",

            parameters: {
                type: "object",

                properties: {
                    command: {
                        type: "string",
                        description:
                            "Build command, usually npm run build.",
                    },
                },

                required: [],
            },
        },
    },

    async execute({
        arguments: args,
        context,
        limits,
    }) {
        if (limits) {
            incrementCommand(limits);
        }

        const command =
            args?.command ||
            "npm run build";

        const result = await executeInExistingWorkspace({
            workspacePath:
                context.workspacePath,

            command,
        });

        if (context?.commandResults) {
            context.commandResults.push({
                command,
                ...result,
            });
        }

        return result;
    },
};