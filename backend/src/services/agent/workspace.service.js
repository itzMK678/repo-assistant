import fs from "fs/promises";
import path from "path";

export function resolveWorkspacePath(
    workspacePath,
    filePath
) {
    const normalized =
        path.posix.normalize(
            String(filePath || "")
                .replaceAll("\\", "/")
        );

    if (
        normalized === ".." ||
        normalized.startsWith("../") ||
        normalized.startsWith("/")
    ) {
        throw new Error(
            `Unsafe workspace path: ${filePath}`
        );
    }

    const fullPath =
        path.resolve(
            workspacePath,
            normalized
        );

    const relative =
        path.relative(
            workspacePath,
            fullPath
        );

    if (
        relative.startsWith("..") ||
        path.isAbsolute(relative)
    ) {
        throw new Error(
            `Unsafe workspace path: ${filePath}`
        );
    }

    return fullPath;
}

export async function readWorkspaceFile({
    workspacePath,
    filePath,
}) {
    const fullPath =
        resolveWorkspacePath(
            workspacePath,
            filePath
        );

    return fs.readFile(
        fullPath,
        "utf8"
    );
}

export async function writeWorkspaceFile({
    workspacePath,
    filePath,
    content,
}) {
    const fullPath =
        resolveWorkspacePath(
            workspacePath,
            filePath
        );

    await fs.mkdir(
        path.dirname(fullPath),
        {
            recursive: true,
        }
    );

    await fs.writeFile(
        fullPath,
        content ?? "",
        "utf8"
    );
}

export async function deleteWorkspaceFile({
    workspacePath,
    filePath,
}) {
    const fullPath =
        resolveWorkspacePath(
            workspacePath,
            filePath
        );

    await fs.rm(
        fullPath,
        {
            force: true,
        }
    );
}