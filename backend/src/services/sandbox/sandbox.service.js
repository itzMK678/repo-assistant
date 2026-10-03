import {
    createWorkspace,
    removeWorkspace,
} from "./workspace.service.js";

import {
    runDockerCommand,
    runDockerCommandInWorkspace,
} from "./docker.service.js";

/**
 * Phase 4: Execute a command in a fresh temporary sandbox workspace,
 * then destroy the workspace afterwards.
 */
export async function executeInSandbox({
    files = [],
    command,
}) {
    if (!command) {
        throw new Error("command is required");
    }

    const workspacePath = await createWorkspace(files);

    try {
        const result = await runDockerCommand({
            workspacePath,
            command,
        });

        return {
            success:
                result.exitCode === 0 &&
                !result.timedOut,
            command,
            stdout: result.stdout,
            stderr: result.stderr,
            exitCode: result.exitCode,
            timedOut: result.timedOut,
        };
    } finally {
        await removeWorkspace(workspacePath);
    }
}

/**
 * Phase 5: Execute a command inside an existing persistent workspace
 * (used by AI agent tools during an active session).
 */
export async function executeInExistingWorkspace({
    workspacePath,
    command,
}) {
    if (!workspacePath) {
        throw new Error("workspacePath is required");
    }

    if (!command) {
        throw new Error("command is required");
    }

    const result = await runDockerCommandInWorkspace({
        workspacePath,
        command,
    });

    return {
        success:
            result.exitCode === 0 &&
            !result.timedOut,
        command,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        timedOut: result.timedOut,
    };
}