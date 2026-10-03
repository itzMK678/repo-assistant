import Docker from "dockerode";
import { env } from "../../config/env.js";

const docker = new Docker();

export async function checkDockerConnection() {
    await docker.ping();

    return {
        connected: true,
    };
}

export async function runDockerCommand({
    workspacePath,
    command,
}) {
    if (!workspacePath) {
        throw new Error("workspacePath is required");
    }

    if (!command) {
        throw new Error("command is required");
    }

    const memoryBytes =
        env.SANDBOX_MEMORY_MB * 1024 * 1024;

    const nanoCpus =
        env.SANDBOX_CPU_COUNT * 1_000_000_000;

    let container = null;

    try {
        container = await docker.createContainer({
            Image: env.DOCKER_SANDBOX_IMAGE,

            WorkingDir: "/workspace",

            Cmd: [
                "sh",
                "-lc",
                command,
            ],

            HostConfig: {
                Binds: [
                    `${workspacePath}:/workspace:rw`,
                ],

                NetworkMode: "none",

                Memory: memoryBytes,

                NanoCpus: nanoCpus,

                PidsLimit: env.SANDBOX_PIDS_LIMIT,

                ReadonlyRootfs: true,

                Tmpfs: {
                    "/tmp":
                        "rw,nosuid,nodev,noexec,size=64m",
                },

                SecurityOpt: [
                    "no-new-privileges:true",
                ],

                CapDrop: [
                    "ALL",
                ],
            },
        });

        await container.start();

        const result = await waitForContainer(
            container,
            env.SANDBOX_TIMEOUT_MS
        );

        return result;
    } finally {
        if (container) {
            try {
                await container.remove({
                    force: true,
                });
            } catch {
                // Ignore cleanup failures.
            }
        }
    }
}

async function waitForContainer(
    container,
    timeoutMs
) {
    let timedOut = false;

    const waitPromise = container.wait();

    const timeoutPromise = new Promise(
        (resolve) => {
            setTimeout(() => {
                timedOut = true;
                resolve({
                    StatusCode: 124,
                });
            }, timeoutMs);
        }
    );

    const result = await Promise.race([
        waitPromise,
        timeoutPromise,
    ]);

    if (timedOut) {
        try {
            await container.kill();
        } catch {
            // Already stopped.
        }
    }

    const logs = await container.logs({
        stdout: true,
        stderr: true,
        timestamps: false,
    });

    const parsedLogs = parseDockerLogs(logs);

    return {
        stdout: parsedLogs.stdout,
        stderr: parsedLogs.stderr,
        exitCode: result.StatusCode,
        timedOut,
    };
}

function parseDockerLogs(buffer) {
    const stdout = [];
    const stderr = [];

    let offset = 0;

    while (offset + 8 <= buffer.length) {
        const streamType = buffer[offset];

        const size = buffer.readUInt32BE(
            offset + 4
        );

        const start = offset + 8;
        const end = start + size;

        if (end > buffer.length) {
            break;
        }

        const content = buffer
            .subarray(start, end)
            .toString();

        if (streamType === 1) {
            stdout.push(content);
        }

        if (streamType === 2) {
            stderr.push(content);
        }

        offset = end;
    }

    return {
        stdout: stdout.join(""),
        stderr: stderr.join(""),
    };
}

export const runDockerCommandInWorkspace = runDockerCommand;