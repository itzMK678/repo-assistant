import {
    toolRegistry,
} from "./tool.registry.js";

export function getToolDefinitions() {
    return Object.values(
        toolRegistry
    ).map(
        (tool) =>
            tool.definition
    );
}
