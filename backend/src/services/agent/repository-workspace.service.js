import fs from "fs/promises";
import os from "os";
import path from "path";
import crypto from "crypto";

import {
    getGithubAccessToken,
    getRepository,
    getRepositoryTree,
    getRepositoryFile,
} from "../github/github.service.js";

import {
    writeWorkspaceFile,
} from "./workspace.service.js";

/**
 * Prepares a persistent local workspace for the agent to work on.
 * Fetches repository files via Phase 2 GitHub service if repository is provided,
 * or initializes an empty/custom workspace.
 */
export async function prepareRepositoryWorkspace({
    repository,
    accessToken,
    userId,
    workspacePath,
    initialFiles = [],
}) {
    // If a valid workspacePath was provided, verify and use it
    if (workspacePath) {
        await fs.mkdir(workspacePath, { recursive: true });
        return workspacePath;
    }

    const sessionId = crypto.randomUUID();
    const targetDir = await fs.mkdtemp(
        path.join(os.tmpdir(), `repoassistant-agent-${sessionId}-`)
    );

    // If initial files were provided, write them
    if (Array.isArray(initialFiles) && initialFiles.length > 0) {
        for (const file of initialFiles) {
            if (file?.path) {
                await writeWorkspaceFile({
                    workspacePath: targetDir,
                    filePath: file.path,
                    content: file.content ?? "",
                });
            }
        }
    }

    // If GitHub repository details are specified, fetch and write repo files
    if (repository?.owner && (repository?.name || repository?.repo)) {
        const owner = repository.owner;
        const repo = repository.name || repository.repo;

        let token = accessToken;
        if (!token && userId) {
            try {
                token = await getGithubAccessToken(userId);
            } catch {
                // Token not found or not authenticated
            }
        }

        if (token) {
            try {
                const repoInfo = await getRepository({
                    accessToken: token,
                    owner,
                    repo,
                });

                const branch = repository.branch || repoInfo.default_branch;

                const treeData = await getRepositoryTree({
                    accessToken: token,
                    owner,
                    repo,
                    branch,
                });

                const blobs = (treeData?.tree || []).filter(
                    (item) => item.type === "blob"
                );

                // Fetch files (limit to sensible count to prevent rate limits)
                for (const item of blobs.slice(0, 100)) {
                    try {
                        const fileData = await getRepositoryFile({
                            accessToken: token,
                            owner,
                            repo,
                            path: item.path,
                            branch,
                        });

                        let content = "";
                        if (fileData.encoding === "base64" && fileData.content) {
                            content = Buffer.from(fileData.content, "base64").toString("utf8");
                        } else if (typeof fileData.content === "string") {
                            content = fileData.content;
                        }

                        await writeWorkspaceFile({
                            workspacePath: targetDir,
                            filePath: item.path,
                            content,
                        });
                    } catch {
                        // Skip binary or inaccessible files
                    }
                }
            } catch (err) {
                console.error("Failed to fetch repository files from GitHub:", err.message);
            }
        }
    }

    return targetDir;
}

export async function cleanupRepositoryWorkspace(workspacePath) {
    if (!workspacePath) return;
    try {
        await fs.rm(workspacePath, {
            recursive: true,
            force: true,
        });
    } catch {
        // Ignore cleanup failure
    }
}
