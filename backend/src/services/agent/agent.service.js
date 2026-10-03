import crypto from "crypto";

import {
    createAgentContext,
} from "./agent.context.js";

import {
    runAgentLoop,
} from "./agent.loop.js";

import {
    nebiusProvider,
} from "./providers/nebius.provider.js";

export async function runAgent({
    task,
    repository,
    workspacePath,
    model = nebiusProvider,
}) {
    if (!task?.trim()) {
        throw new Error(
            "Agent task is required"
        );
    }

    if (!workspacePath) {
        throw new Error(
            "workspacePath is required"
        );
    }

    const sessionId =
        crypto.randomUUID();

    const context =
        createAgentContext({
            sessionId,
            task,
            repository,
        });

    context.workspacePath =
        workspacePath;

    const result =
        await runAgentLoop({
            context,
            model,
        });

    return {
        sessionId,
        success:
            result.success,
        result,
        changedFiles:
            Array.from(
                context.filesChanged
            ),
        toolResults:
            context.toolResults,
    };
}