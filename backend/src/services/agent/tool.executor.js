import path from "path";
import { toolRegistry } from "./tool.registry.js";
import {
    listFilesSchema,
    readFileSchema,
    searchCodeSchema,
    findFileSchema,
    writeFileSchema,
    createFileSchema,
    deleteFileSchema,
    runCommandSchema,
    runTestsSchema,
    runBuildSchema,
} from "./tool.schemas.js";

const toolSchemas = {
    list_files: listFilesSchema,
    read_file: readFileSchema,
    search_code: searchCodeSchema,
    find_file: findFileSchema,
    write_file: writeFileSchema,
    create_file: createFileSchema,
    delete_file: deleteFileSchema,
    run_command: runCommandSchema,
    run_tests: runTestsSchema,
    run_build: runBuildSchema,
};

export function validateRelativePath(filePath) {
    const normalized = path.posix.normalize(
        String(filePath || "").replaceAll("\\", "/")
    );

    if (
        normalized === ".." ||
        normalized.startsWith("../") ||
        normalized.startsWith("/")
    ) {
        throw new Error(`Unsafe path: ${filePath}`);
    }

    return normalized;
}

export async function executeTool({
    name,
    arguments: args,
    context,
    limits,
}) {
    const tool = toolRegistry[name];

    if (!tool) {
        throw new Error(`Unknown tool: ${name}`);
    }

    const schema = toolSchemas[name];
    let validatedArgs = args;

    if (schema) {
        const parsed = schema.safeParse(args || {});
        if (!parsed.success) {
            throw new Error(
                `Invalid arguments for tool ${name}: ${parsed.error.issues.map(i => i.message).join(", ")}`
            );
        }
        validatedArgs = parsed.data;
    }

    return tool.execute({
        arguments: validatedArgs,
        context,
        limits,
        validateRelativePath,
    });
}
