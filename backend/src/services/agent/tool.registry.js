import {
    listFilesTool,
} from "./tools/list-files.tool.js";

import {
    readFileTool,
} from "./tools/read-file.tool.js";

import {
    searchCodeTool,
} from "./tools/search-code.tool.js";

import {
    findFileTool,
} from "./tools/find-file.tool.js";

import {
    writeFileTool,
} from "./tools/write-file.tool.js";

import {
    createFileTool,
} from "./tools/create-file.tool.js";

import {
    deleteFileTool,
} from "./tools/delete-file.tool.js";

import {
    runCommandTool,
} from "./tools/run-command.tool.js";

import {
    runTestsTool,
} from "./tools/run-tests.tool.js";

import {
    runBuildTool,
} from "./tools/run-build.tool.js";

export const toolRegistry = {
    list_files: listFilesTool,
    read_file: readFileTool,
    search_code: searchCodeTool,
    find_file: findFileTool,

    write_file: writeFileTool,
    create_file: createFileTool,
    delete_file: deleteFileTool,

    run_command: runCommandTool,
    run_tests: runTestsTool,
    run_build: runBuildTool,
};
