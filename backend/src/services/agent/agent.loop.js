import {
    getToolDefinitions,
} from "./tool.definitions.js";

import {
    executeTool,
} from "./tool.executor.js";

import {
    AGENT_SYSTEM_PROMPT,
} from "./agent.prompt.js";

import {
    createAgentLimits,
    incrementIteration,
    incrementToolCall,
    checkExecutionTime,
} from "./agent.limits.js";

import {
    emitAgentEvent,
} from "./agent.events.js";

export async function runAgentLoop({
    context,
    model,
}) {
    const limits =
        createAgentLimits();

    context.messages = [
        {
            role: "system",
            content: AGENT_SYSTEM_PROMPT,
        },
        {
            role: "user",
            content: context.task,
        },
    ];

    const tools =
        getToolDefinitions();

    while (true) {
        checkExecutionTime(
            limits
        );

        incrementIteration(
            limits
        );

        context.iteration =
            limits.iterations;

        emitAgentEvent({
            sessionId: context.sessionId,
            type: "iteration_started",
            data: {
                iteration: limits.iterations,
            },
        });

        const response =
            await model.generate({
                messages:
                    context.messages,
                tools,
            });

        const message =
            response?.choices?.[0]
                ?.message;

        if (!message) {
            throw new Error(
                "Model returned an invalid response"
            );
        }

        context.messages.push(
            message
        );

        const toolCalls =
            message.tool_calls || [];

        if (
            toolCalls.length === 0
        ) {
            emitAgentEvent({
                sessionId: context.sessionId,
                type: "agent_completed",
                data: {
                    finalMessage: message.content || "",
                    iterations: limits.iterations,
                    toolCalls: limits.toolCalls,
                },
            });

            return {
                success: true,
                finalMessage:
                    message.content || "",
                iterations:
                    limits.iterations,
                toolCalls:
                    limits.toolCalls,
            };
        }

        for (
            const toolCall
            of toolCalls
        ) {
            checkExecutionTime(
                limits
            );

            incrementToolCall(
                limits
            );

            const name =
                toolCall
                    ?.function
                    ?.name;

            const rawArguments =
                toolCall
                    ?.function
                    ?.arguments ||
                "{}";

            let args;

            try {
                args =
                    typeof rawArguments === "string"
                        ? JSON.parse(rawArguments)
                        : rawArguments;
            } catch {
                throw new Error(
                    `Invalid JSON arguments for tool ${name}`
                );
            }

            emitAgentEvent({
                sessionId: context.sessionId,
                type: "tool_started",
                data: {
                    tool: name,
                    arguments: args,
                },
            });

            let result;

            try {
                result =
                    await executeTool({
                        name,
                        arguments: args,
                        context,
                        limits,
                    });
            } catch (error) {
                result = {
                    success: false,
                    error: error.message,
                };
            }

            emitAgentEvent({
                sessionId: context.sessionId,
                type: "tool_finished",
                data: {
                    tool: name,
                    success: result.success !== false,
                    result,
                },
            });

            context.toolResults.push({
                tool: name,
                arguments: args,
                result,
            });

            context.messages.push({
                role: "tool",
                tool_call_id:
                    toolCall.id,
                content:
                    JSON.stringify(
                        result
                    ),
            });
        }
    }
}