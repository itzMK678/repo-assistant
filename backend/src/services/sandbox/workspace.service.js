import fs from "fs/promises";
import os from "os";
import path from "path";
import crypto from "crypto";

function normalizeRelativePath(filePath) {
    const normalized = path.posix.normalize(
        String(filePath).replaceAll("\\", "/")
    );

    if (
        normalized.startsWith("../") ||
        normalized === ".." ||
        normalized.startsWith("/")
    ) {
        throw new Error(`Unsafe file path: ${filePath}`);
    }

    return normalized;
}

export async function createWorkspace(files = []) {
    const workspaceId = crypto.randomUUID();

    const workspacePath = await fs.mkdtemp(
        path.join(os.tmpdir(), `repoassistant-${workspaceId}-`)
    );

    for (const file of files) {
        if (!file?.path) {
            continue;
        }

        const safePath = normalizeRelativePath(file.path);

        const destination = path.join(workspacePath, safePath);

        const relative = path.relative(workspacePath, destination);

        if (
            relative.startsWith("..") ||
            path.isAbsolute(relative)
        ) {
            throw new Error(`Unsafe file path: ${file.path}`);
        }

        await fs.mkdir(path.dirname(destination), {
            recursive: true,
        });

        await fs.writeFile(
            destination,
            file.content ?? "",
            "utf8"
        );
    }

    return workspacePath;
}

export async function removeWorkspace(workspacePath) {
    if (!workspacePath) {
        return;
    }

    try {
        await fs.rm(workspacePath, {
            recursive: true,
            force: true,
        });
    } catch (error) {
        console.error(
            "Failed to remove sandbox workspace:",
            error
        );
    }
}