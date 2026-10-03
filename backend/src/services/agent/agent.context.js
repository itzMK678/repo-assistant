export function createAgentContext({
    sessionId,
    task,
    repository,
}) {
    return {
        sessionId,

        task,

        repository,

        messages: [],

        filesRead: new Set(),

        filesChanged: new Set(),

        commandResults: [],

        toolResults: [],

        iteration: 0,
    };
}