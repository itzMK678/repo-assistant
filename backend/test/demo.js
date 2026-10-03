import fs from "fs/promises";
import os from "os";
import path from "path";
import { runAgent } from "../src/services/agent/agent.service.js";
import { agentEvents } from "../src/services/agent/agent.events.js";
import { env } from "../src/config/env.js";
import { nebiusProvider } from "../src/services/agent/providers/nebius.provider.js";

async function runDemo() {
    console.log("=================================================");
    console.log("       RepoAssistant — Phase 5 Agent Demo        ");
    console.log("=================================================\n");

    const tmpWorkspace = await fs.mkdtemp(path.join(os.tmpdir(), "repoassistant-demo-"));
    console.log(`📁 Persistent workspace created:\n   ${tmpWorkspace}\n`);

    const hasRealNebius =
        env.NEBIUS_BASE_URL &&
        !env.NEBIUS_BASE_URL.includes("YOUR_") &&
        env.NEBIUS_API_KEY &&
        !env.NEBIUS_API_KEY.includes("YOUR_") &&
        env.NEBIUS_MODEL &&
        !env.NEBIUS_MODEL.includes("YOUR_");

    let model;
    if (hasRealNebius) {
        console.log(`🤖 Using real Nebius model: ${env.NEBIUS_MODEL}\n`);
        model = nebiusProvider;
    } else {
        console.log("ℹ️  Nebius API keys are currently placeholder values in .env.");
        console.log("   Running simulated AI agent to demonstrate end-to-end tool calling,");
        console.log("   real Docker sandbox execution, and live event emissions!\n");

        let step = 0;
        model = {
            async generate() {
                step++;
                if (step === 1) {
                    return {
                        choices: [{
                            message: {
                                role: "assistant",
                                tool_calls: [{
                                    id: "call_list",
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
                                tool_calls: [{
                                    id: "call_create_fib",
                                    type: "function",
                                    function: {
                                        name: "create_file",
                                        arguments: JSON.stringify({
                                            path: "fibonacci.js",
                                            content: `function fib(n) {\n    if (n <= 1) return n;\n    return fib(n - 1) + fib(n - 2);\n}\nmodule.exports = fib;\n`,
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
                                    id: "call_create_test",
                                    type: "function",
                                    function: {
                                        name: "create_file",
                                        arguments: JSON.stringify({
                                            path: "test.js",
                                            content: `const fib = require('./fibonacci');\nconst assert = require('assert');\nassert.strictEqual(fib(7), 13);\nconsole.log('FIBONACCI TEST PASSED: fib(7) === 13');\n`,
                                        }),
                                    },
                                }],
                            },
                        }],
                    };
                } else if (step === 4) {
                    return {
                        choices: [{
                            message: {
                                role: "assistant",
                                tool_calls: [{
                                    id: "call_run_docker",
                                    type: "function",
                                    function: {
                                        name: "run_command",
                                        arguments: JSON.stringify({
                                            command: "node test.js",
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
                                content: "Successfully implemented Fibonacci calculator, generated unit tests, and verified execution inside Docker container.",
                            },
                        }],
                    };
                }
            },
        };
    }

    const task = "Create a Fibonacci module, write a test for it, and run the test in Docker.";
    console.log(`📋 Task: "${task}"\n`);
    console.log("--- LIVE AGENT EVENTS ---");

    const listener = (event) => {
        const time = new Date(event.timestamp).toLocaleTimeString();
        if (event.type === "iteration_started") {
            console.log(`\n🔄 [${time}] Iteration #${event.data.iteration} started`);
        } else if (event.type === "tool_started") {
            console.log(`🔧 [${time}] Model invoked tool: ${event.data.tool}`);
            if (event.data.arguments) {
                console.log(`   Arguments:`, JSON.stringify(event.data.arguments));
            }
        } else if (event.type === "tool_finished") {
            const status = event.data.success ? "SUCCESS" : "ERROR";
            console.log(`✅ [${time}] Tool ${event.data.tool} finished (${status})`);
            if (event.data.result?.stdout) {
                console.log(`   🐳 Docker stdout: ${event.data.result.stdout.trim()}`);
            }
        } else if (event.type === "agent_completed") {
            console.log(`\n🎉 [${time}] Agent completed!`);
            console.log(`   Iterations: ${event.data.iterations}, Tool Calls: ${event.data.toolCalls}`);
            console.log(`   Summary: "${event.data.finalMessage}"`);
        }
    };

    agentEvents.on("agent_event", listener);

    try {
        const response = await runAgent({
            task,
            workspacePath: tmpWorkspace,
            model,
        });

        console.log("\n--- AGENT RESULT SUMMARY ---");
        console.log(`Session ID   : ${response.sessionId}`);
        console.log(`Success      : ${response.success}`);
        console.log(`Changed Files:`, response.changedFiles);
        console.log("\nFiles in persistent workspace after execution:");
        const files = await fs.readdir(tmpWorkspace);
        for (const file of files) {
            console.log(`  - ${file}`);
        }

        console.log("\n=================================================");
        console.log("    Demo completed successfully! Everything works!   ");
        console.log("=================================================");
    } catch (err) {
        console.error("\n❌ Agent failed with error:", err.message);
    } finally {
        agentEvents.off("agent_event", listener);
        try {
            await fs.rm(tmpWorkspace, { recursive: true, force: true });
        } catch {}
    }
}

runDemo().catch(console.error);
