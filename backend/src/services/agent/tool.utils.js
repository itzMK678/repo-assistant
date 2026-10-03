export function createToolDefinition({
    name,
    description,
    parameters,
}) {
    return {
        type: "function",
        function: {
            name,
            description,
            parameters,
        },
    };
}
