import assert from "assert";
import fs from "fs/promises";
import os from "os";
import path from "path";
import crypto from "crypto";

import { createAgentLimits, incrementIteration, incrementToolCall, incrementCommand, trackChangedFile, checkExecutionTime } from "../src/services/agent/agent.limits.js";
import { createAgentContext } from "../src/services/agent/agent.context.js";
import { agentEvents } from "../src/services/agent/agent.events.js";
import { toolRegistry } from "../src/services/agent/tool.registry.js";
import { getToolDefinitions } from "../src/services/agent/tool.definitions.js";
import { executeTool, validateRelativePath } from "../src/services/agent/tool.executor.js";
import { writeWorkspaceFile, readWorkspaceFile, deleteWorkspaceFile, resolveWorkspacePath } from "../src/services/agent/workspace.service.js";
import { executeInExistingWorkspace, executeInSandbox } from "../src/services/sandbox/sandbox.service.js";
import { runAgent } from "../src/services/agent/agent.service.js";
import { runAgentLoop } from "../src/services/agent/agent.loop.js";

async function createTempWorkspace(initialFiles = {}) {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "phase5-test-"));
    for (const [relPath, content] of Object.entries(initialFiles)) {
        const full = path.join(tmp, relPath);
        await fs.mkdir(path.dirname(full), { recursive: true });
        await fs.writeFile(full, content, "utf8");
    }
    return tmp;
}

async function cleanupWorkspace(dir) {
    try {
        await fs.rm(dir, { recursive: true, force: true });
    } catch {
        // ignore
    }
}

async function runTests() {
    console.log("=== STARTING PHASE 5 VERIFICATION SUITE ===\n");

    let passed = 0;
    let failed = 0;

    async function test(name, fn) {
        try {
            process.stdout.write(`Testing: ${name} ... `);
            await fn();
            console.log("PASSED");
            passed++;
        } catch (err) {
            console.log("FAILED");
            console.error("  Error:", err.message);
            failed++;
        }
    }

    // 1. Tool Schemas & Definitions
    await test("Tool definitions are registered and valid", async () => {
        const defs = getToolDefinitions();
        assert.strictEqual(defs.length, 10, "Should have 10 tools defined");
        const names = defs.map(d => d.function.name);
        const expected = [
            "list_files", "read_file", "search_code", "find_file",
            "write_file", "create_file", "delete_file",
            "run_command", "run_tests", "run_build"
        ];
        for (const exp of expected) {
            assert.ok(names.includes(exp), `Tool ${exp} should be defined`);
        }
    });

    // 2. Safe Path Validation
    await test("Path traversal security check", async () => {
        assert.throws(() => validateRelativePath("../secret.txt"), /Unsafe path/);
        assert.throws(() => validateRelativePath("/etc/passwd"), /Unsafe path/);
        assert.strictEqual(validateRelativePath("src/utils/index.js"), "src/utils/index.js");
        assert.strictEqual(validateRelativePath("src\\utils\\index.js"), "src/utils/index.js");
    });

    // 3. Workspace File Operations
    await test("Workspace file operations (create, read, write, delete)", async () => {
        const ws = await createTempWorkspace();
        try {
            await writeWorkspaceFile({ workspacePath: ws, filePath: "src/math.js", content: "export const x = 42;" });
            const content = await readWorkspaceFile({ workspacePath: ws, filePath: "src/math.js" });
            assert.strictEqual(content, "export const x = 42;");

            await deleteWorkspaceFile({ workspacePath: ws, filePath: "src/math.js" });
            let readFailed = false;
            try {
                await readWorkspaceFile({ workspacePath: ws, filePath: "src/math.js" });
            } catch {
                readFailed = true;
            }
            assert.ok(readFailed, "File should have been deleted");
        } finally {
            await cleanupWorkspace(ws);
        }
    });

    // 4. File Tools via Tool Executor
    await test("File tools via executeTool (list_files, read_file, search_code, find_file)", async () => {
        const ws = await createTempWorkspace({
            "src/index.js": "console.log('index');",
            "src/components/App.jsx": "function App() { return <div>App</div>; }",
            "README.md": "# Readme",
        });

        const limits = createAgentLimits();
        const context = createAgentContext({ sessionId: "test-session", task: "inspect", repository: null });
        context.workspacePath = ws;

        try {
            // list_files
            const listRes = await executeTool({ name: "list_files", arguments: {}, context, limits });
            assert.ok(listRes.files.includes("src/index.js"));
            assert.ok(listRes.files.includes("src/components/App.jsx"));

            // read_file
            const readRes = await executeTool({ name: "read_file", arguments: { path: "src/index.js" }, context, limits });
            assert.strictEqual(readRes.content, "console.log('index');");

            // search_code
            const searchRes = await executeTool({ name: "search_code", arguments: { query: "App" }, context, limits });
            assert.ok(searchRes.matches.some(m => m.path === "src/components/App.jsx"));

            // find_file
            const findRes = await executeTool({ name: "find_file", arguments: { name: "App" }, context, limits });
            assert.ok(findRes.matches.some(m => m.includes("App.jsx")));

            // create_file existing should error
            let createExistingFailed = false;
            try {
                await executeTool({ name: "create_file", arguments: { path: "src/index.js", content: "new" }, context, limits });
            } catch {
                createExistingFailed = true;
            }
            assert.ok(createExistingFailed, "create_file should fail on existing file");

        } finally {
            await cleanupWorkspace(ws);
        }
    });

    // 5. Docker Sandbox Execution in Persistent Workspace
    await test("Docker sandbox execution in persistent workspace", async () => {
        const ws = await createTempWorkspace({
            "calc.js": "const a = 10, b = 20; console.log(a + b);",
        });

        try {
            const res = await executeInExistingWorkspace({
                workspacePath: ws,
                command: "node calc.js",
            });

            assert.strictEqual(res.success, true);
            assert.strictEqual(res.exitCode, 0);
            assert.strictEqual(res.stdout.trim(), "30");

            // Modify in place and run again to prove workspace persistence!
            await writeWorkspaceFile({
                workspacePath: ws,
                filePath: "calc.js",
                content: "console.log('persistent-check');",
            });

            const res2 = await executeInExistingWorkspace({
                workspacePath: ws,
                command: "node calc.js",
            });

            assert.strictEqual(res2.success, true);
            assert.strictEqual(res2.stdout.trim(), "persistent-check");
        } finally {
            await cleanupWorkspace(ws);
        }
    });

    // 6. Test #1 — Simple file creation end-to-end
    await test("Phase 5 Test #1: Simple file creation and execution", async () => {
        const ws = await createTempWorkspace();
        try {
            // Mock model that decides to inspect -> create file -> run command -> complete
            let step = 0;
            const mockModel = {
                async generate({ messages, tools }) {
                    step++;
                    if (step === 1) {
                        return {
                            choices: [{
                                message: {
                                    role: "assistant",
                                    content: null,
                                    tool_calls: [{
                                        id: "call_1",
                                        type: "function",
                                        function: {
                                            name: "list_files",
                                            arguments: "{}",
                                        },
                                    }],
                                },
                            }],
                        };
                    } else if (step === 2) {
                        return {
                            choices: [{
                                message: {
                                    role: "assistant",
                                    content: null,
                                    tool_calls: [{
                                        id: "call_2",
                                        type: "function",
                                        function: {
                                            name: "create_file",
                                            arguments: JSON.stringify({
                                                path: "hello.js",
                                                content: 'console.log("Hello RepoAssistant");',
                                            }),
                                        },
                                    }],
                                },
                            }],
                        };
                    } else if (step === 3) {
                        return {
                            choices: [{
                                message: {
                                    role: "assistant",
                                    content: null,
                                    tool_calls: [{
                                        id: "call_3",
                                        type: "function",
                                        function: {
                                            name: "run_command",
                                            arguments: JSON.stringify({
                                                command: "node hello.js",
                                            }),
                                        },
                                    }],
                                },
                            }],
                        };
                    } else {
                        return {
                            choices: [{
                                message: {
                                    role: "assistant",
                                    content: "Created hello.js and successfully executed it in Docker.",
                                },
                            }],
                        };
                    }
                },
            };

            const result = await runAgent({
                task: "Create hello.js with console.log('Hello RepoAssistant'); and run it",
                workspacePath: ws,
                model: mockModel,
            });

            assert.strictEqual(result.success, true);
            assert.ok(result.changedFiles.includes("hello.js"));
            const fileOnDisk = await readWorkspaceFile({ workspacePath: ws, filePath: "hello.js" });
            assert.strictEqual(fileOnDisk, 'console.log("Hello RepoAssistant");');
        } finally {
            await cleanupWorkspace(ws);
        }
    });

    // 7. Test #2 — Inspect repository (no code modification)
    await test("Phase 5 Test #2: Inspect repository without modifying files", async () => {
        const ws = await createTempWorkspace({
            "src/index.jsx": "import React from 'react';\nexport default function App() {}",
            "package.json": '{"name": "test-app"}',
        });

        try {
            let step = 0;
            const mockModel = {
                async generate({ messages, tools }) {
                    step++;
                    if (step === 1) {
                        return {
                            choices: [{
                                message: {
                                    role: "assistant",
                                    tool_calls: [{
                                        id: "c1",
                                        type: "function",
                                        function: {
                                            name: "find_file",
                                            arguments: JSON.stringify({ name: "index.jsx" }),
                                        },
                                    }],
                                },
                            }],
                        };
                    } else if (step === 2) {
                        return {
                            choices: [{
                                message: {
                                    role: "assistant",
                                    tool_calls: [{
                                        id: "c2",
                                        type: "function",
                                        function: {
                                            name: "read_file",
                                            arguments: JSON.stringify({ path: "src/index.jsx" }),
                                        },
                                    }],
                                },
                            }],
                        };
                    } else {
                        return {
                            choices: [{
                                message: {
                                    role: "assistant",
                                    content: "The main entry point is src/index.jsx.",
                                },
                            }],
                        };
                    }
                },
            };

            const result = await runAgent({
                task: "Find the React application's main entry point",
                workspacePath: ws,
                model: mockModel,
            });

            assert.strictEqual(result.success, true);
            assert.strictEqual(result.changedFiles.length, 0, "No files should be modified during inspection");
            assert.ok(result.result.finalMessage.includes("src/index.jsx"));
        } finally {
            await cleanupWorkspace(ws);
        }
    });

    // 8. Test #3 — Fix a bug and run tests
    await test("Phase 5 Test #3: Fix a bug and run test suite", async () => {
        const ws = await createTempWorkspace({
            "add.js": "function add(a, b) {\n    return a - b;\n}\nmodule.exports = add;\n",
            "test.js": "const add = require('./add');\nconst assert = require('assert');\nassert.strictEqual(add(2, 3), 5);\nconsole.log('TEST PASSED');\n",
        });

        try {
            let step = 0;
            const mockModel = {
                async generate({ messages, tools }) {
                    step++;
                    if (step === 1) {
                        return {
                            choices: [{
                                message: {
                                    role: "assistant",
                                    tool_calls: [{
                                        id: "c1",
                                        type: "function",
                                        function: {
                                            name: "read_file",
                                            arguments: JSON.stringify({ path: "add.js" }),
                                        },
                                    }],
                                },
                            }],
                        };
                    } else if (step === 2) {
                        return {
                            choices: [{
                                message: {
                                    role: "assistant",
                                    tool_calls: [{
                                        id: "c2",
                                        type: "function",
                                        function: {
                                            name: "write_file",
                                            arguments: JSON.stringify({
                                                path: "add.js",
                                                content: "function add(a, b) {\n    return a + b;\n}\nmodule.exports = add;\n",
                                            }),
                                        },
                                    }],
                                },
                            }],
                        };
                    } else if (step === 3) {
                        return {
                            choices: [{
                                message: {
                                    role: "assistant",
                                    tool_calls: [{
                                        id: "c3",
                                        type: "function",
                                        function: {
                                            name: "run_command",
                                            arguments: JSON.stringify({ command: "node test.js" }),
                                        },
                                    }],
                                },
                            }],
                        };
                    } else {
                        return {
                            choices: [{
                                message: {
                                    role: "assistant",
                                    content: "Fixed the add function and test passed.",
                                },
                            }],
                        };
                    }
                },
            };

            const result = await runAgent({
                task: "Fix the add function and run tests",
                workspacePath: ws,
                model: mockModel,
            });

            assert.strictEqual(result.success, true);
            assert.ok(result.changedFiles.includes("add.js"));
            const updatedAdd = await readWorkspaceFile({ workspacePath: ws, filePath: "add.js" });
            assert.ok(updatedAdd.includes("return a + b;"));
        } finally {
            await cleanupWorkspace(ws);
        }
    });

    // 9. Test #4 — Failing test -> fix -> passing test loop
    await test("Phase 5 Test #4: Failing test -> inspection -> fix -> passing test", async () => {
        const ws = await createTempWorkspace({
            "code.js": "module.exports = function isPositive(n) { return n < 0; };",
            "test.js": "const isPositive = require('./code');\nif (!isPositive(5)) throw new Error('Assertion failed: 5 should be positive');\nconsole.log('ALL TESTS PASSED');",
        });

        try {
            let step = 0;
            const mockModel = {
                async generate({ messages, tools }) {
                    step++;
                    if (step === 1) {
                        // First run the test to see failure
                        return {
                            choices: [{
                                message: {
                                    role: "assistant",
                                    tool_calls: [{
                                        id: "t1",
                                        type: "function",
                                        function: {
                                            name: "run_command",
                                            arguments: JSON.stringify({ command: "node test.js" }),
                                        },
                                    }],
                                },
                            }],
                        };
                    } else if (step === 2) {
                        // Inspect the failing code
                        return {
                            choices: [{
                                message: {
                                    role: "assistant",
                                    tool_calls: [{
                                        id: "t2",
                                        type: "function",
                                        function: {
                                            name: "read_file",
                                            arguments: JSON.stringify({ path: "code.js" }),
                                        },
                                    }],
                                },
                            }],
                        };
                    } else if (step === 3) {
                        // Fix the code
                        return {
                            choices: [{
                                message: {
                                    role: "assistant",
                                    tool_calls: [{
                                        id: "t3",
                                        type: "function",
                                        function: {
                                            name: "write_file",
                                            arguments: JSON.stringify({
                                                path: "code.js",
                                                content: "module.exports = function isPositive(n) { return n > 0; };",
                                            }),
                                        },
                                    }],
                                },
                            }],
                        };
                    } else if (step === 4) {
                        // Re-run the test to verify pass
                        return {
                            choices: [{
                                message: {
                                    role: "assistant",
                                    tool_calls: [{
                                        id: "t4",
                                        type: "function",
                                        function: {
                                            name: "run_command",
                                            arguments: JSON.stringify({ command: "node test.js" }),
                                        },
                                    }],
                                },
                            }],
                        };
                    } else {
                        return {
                            choices: [{
                                message: {
                                    role: "assistant",
                                    content: "Tests failed initially, corrected isPositive logic, tests now pass.",
                                },
                            }],
                        };
                    }
                },
            };

            const result = await runAgent({
                task: "Debug failing tests and verify fix",
                workspacePath: ws,
                model: mockModel,
            });

            assert.strictEqual(result.success, true);
            const finalCode = await readWorkspaceFile({ workspacePath: ws, filePath: "code.js" });
            assert.ok(finalCode.includes("n > 0"));
            assert.strictEqual(result.toolResults.length, 4);
            // Verify step 1 test failed (success === false)
            assert.strictEqual(result.toolResults[0].result.success, false);
            // Verify step 4 test passed (success === true)
            assert.strictEqual(result.toolResults[3].result.success, true);
        } finally {
            await cleanupWorkspace(ws);
        }
    });

    // 10. Test #5 — Agent Limits Safeguards
    await test("Phase 5 Test #5: Agent limits safeguard enforcement", async () => {
        // Test iteration limit
        const limits = createAgentLimits();
        limits.maxIterations = 3;
        incrementIteration(limits);
        incrementIteration(limits);
        incrementIteration(limits);
        assert.throws(() => incrementIteration(limits), /Maximum agent iterations exceeded/);

        // Test command limit
        limits.maxCommands = 2;
        incrementCommand(limits);
        incrementCommand(limits);
        assert.throws(() => incrementCommand(limits), /Maximum agent command executions exceeded/);

        // Test tool calls limit
        limits.maxToolCalls = 2;
        incrementToolCall(limits);
        incrementToolCall(limits);
        assert.throws(() => incrementToolCall(limits), /Maximum agent tool calls exceeded/);

        // Test changed files limit
        limits.maxChangedFiles = 2;
        trackChangedFile(limits, "file1.js");
        trackChangedFile(limits, "file2.js");
        assert.throws(() => trackChangedFile(limits, "file3.js"), /Maximum changed files exceeded/);

        // Test execution time limit
        limits.startedAt = Date.now() - 500000;
        limits.maxExecutionTime = 10000;
        assert.throws(() => checkExecutionTime(limits), /Maximum agent execution time exceeded/);
    });

    // 11. Event System Emission
    await test("Internal agent events are emitted during execution", async () => {
        const events = [];
        const listener = (evt) => events.push(evt);
        agentEvents.on("session:event-test-session", listener);

        const ws = await createTempWorkspace();
        try {
            const mockModel = {
                async generate() {
                    return {
                        choices: [{
                            message: {
                                role: "assistant",
                                content: "Done",
                            },
                        }],
                    };
                },
            };

            const context = createAgentContext({ sessionId: "event-test-session", task: "simple", repository: null });
            context.workspacePath = ws;
            await runAgentLoop({ context, model: mockModel });

            assert.ok(events.some(e => e.type === "iteration_started"));
            assert.ok(events.some(e => e.type === "agent_completed"));
        } finally {
            agentEvents.off("session:event-test-session", listener);
            await cleanupWorkspace(ws);
        }
    });

    console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===\n`);
    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error("FATAL SUITE ERROR:", err);
    process.exit(1);
});
