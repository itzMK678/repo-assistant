import {
    executeInExistingWorkspace,
} from "../../sandbox/sandbox.service.js";

import {
    incrementCommand,
} from "../agent.limits.js";

export const runTestsTool = {
    definition: {
        type: "function",

        function: {
            name: "run_tests",

            description:
                "Run the project's tests inside the Docker sandbox.",

            parameters: {
                type: "object",

                properties: {
                    command: {
                        type: "string",
                        description:
                            "Test command, usually npm test.",
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
            "npm test";

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
