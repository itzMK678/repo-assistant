import { env } from "../../config/env.js";

export function createAgentLimits() {
    return {
        iterations: 0,
        toolCalls: 0,
        commands: 0,
        changedFiles: new Set(),

        startedAt: Date.now(),

        maxIterations:
            env.MAX_AGENT_ITERATIONS || 12,

        maxToolCalls:
            env.MAX_AGENT_TOOL_CALLS || 30,

        maxCommands:
            env.MAX_AGENT_COMMANDS || 15,

        maxExecutionTime:
            env.MAX_AGENT_EXECUTION_TIME_MS || 300000,

        maxChangedFiles:
            env.MAX_AGENT_CHANGED_FILES || 30,
    };
}

export function checkExecutionTime(limits) {
    const elapsed =
        Date.now() - limits.startedAt;

    if (
        elapsed >
        limits.maxExecutionTime
    ) {
        throw new Error(
            "Maximum agent execution time exceeded"
        );
    }
}

export function incrementIteration(limits) {
    limits.iterations += 1;

    if (
        limits.iterations >
        limits.maxIterations
    ) {
        throw new Error(
            "Maximum agent iterations exceeded"
        );
    }
}

export function incrementToolCall(limits) {
    limits.toolCalls += 1;

    if (
        limits.toolCalls >
        limits.maxToolCalls
    ) {
        throw new Error(
            "Maximum agent tool calls exceeded"
        );
    }
}

export function incrementCommand(limits) {
    limits.commands += 1;

    if (
        limits.commands >
        limits.maxCommands
    ) {
        throw new Error(
            "Maximum agent command executions exceeded"
        );
    }
}

export function trackChangedFile(
    limits,
    filePath
) {
    limits.changedFiles.add(filePath);

    if (
        limits.changedFiles.size >
        limits.maxChangedFiles
    ) {
        throw new Error(
            "Maximum changed files exceeded"
        );
    }
}