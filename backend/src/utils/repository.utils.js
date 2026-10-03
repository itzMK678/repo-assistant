const IGNORED_DIRECTORIES = new Set([
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build",
    "coverage",
    ".venv",
    "venv",
    "__pycache__"
]);

const IMPORTANT_FILES = new Set([
    "package.json",
    "README.md",
    "requirements.txt",
    "pyproject.toml",
    "Dockerfile",
    "docker-compose.yml",
    "next.config.js",
    "next.config.mjs",
    "vite.config.js",
    "vite.config.mjs",
    "tsconfig.json",
    "jsconfig.json",
    ".env.example"
]);

export function isIgnoredPath(path) {
    const parts = path.split("/");

    return parts.some((part) =>
        IGNORED_DIRECTORIES.has(part)
    );
}

export function isImportantFile(path) {
    const fileName = path.split("/").pop();

    return IMPORTANT_FILES.has(fileName);
}

export function getFileExtension(path) {
    const fileName = path.split("/").pop();

    if (!fileName || !fileName.includes(".")) {
        return null;
    }

    return fileName.substring(
        fileName.lastIndexOf(".") + 1
    ).toLowerCase();
}

export function isPotentialCodeFile(path) {
    const extension = getFileExtension(path);

    const supportedExtensions = new Set([
        "js",
        "jsx",
        "mjs",
        "cjs",
        "ts",
        "tsx",
        "py",
        "java",
        "cpp",
        "c",
        "h",
        "hpp",
        "cs",
        "go",
        "rs",
        "php",
        "rb",
        "swift",
        "kt",
        "kts",
        "html",
        "css",
        "scss",
        "sql",
        "json",
        "yaml",
        "yml",
        "md"
    ]);

    return supportedExtensions.has(extension);
}