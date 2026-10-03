import { EventEmitter } from "events";

export const agentEvents =
    new EventEmitter();

export function emitAgentEvent({
    sessionId,
    type,
    data = {},
}) {
    const payload = {
        sessionId,
        type,
        timestamp: new Date().toISOString(),
        data,
    };

    // Emit on the session-specific channel
    agentEvents.emit(`session:${sessionId}`, payload);

    // Also emit on global channel for monitoring and logging
    agentEvents.emit("agent_event", payload);
}
