import {
    getRepository,
    getRepositoryTree,
    getRepositoryFile,
    searchRepositoryCode
} from "../github/github.service.js";

import {
    isIgnoredPath,
    isImportantFile,
    isPotentialCodeFile,
    getFileExtension
} from "../../utils/repository.utils.js";


/**
 * Get basic repository information.
 */
export async function analyzeRepository({
    accessToken,
    owner,
    repo
}) {
    const repository = await getRepository({
        accessToken,
        owner,
        repo
    });

    const branch = repository.default_branch;

    const tree = await getRepositoryTree({
        accessToken,
        owner,
        repo,
        branch
    });

    const treeItems = Array.isArray(tree?.tree) ? tree.tree : [];

    const files = treeItems
        .filter((item) => item.type === "blob")
        .filter((item) => !isIgnoredPath(item.path));

    const directories = treeItems
        .filter((item) => item.type === "tree")
        .filter((item) => !isIgnoredPath(item.path));

    const importantFiles = files.filter((file) =>
        isImportantFile(file.path)
    );

    const codeFiles = files.filter((file) =>
        isPotentialCodeFile(file.path)
    );

    return {
        repository: {
            id: repository.id,
            name: repository.name,
            fullName: repository.full_name,
            owner: repository.owner.login,
            defaultBranch: branch,
            private: repository.private,
            language: repository.language,
            description: repository.description
        },

        statistics: {
            totalFiles: files.length,
            totalDirectories: directories.length,
            totalCodeFiles: codeFiles.length
        },

        importantFiles: importantFiles.map((file) => ({
            path: file.path,
            size: file.size
        })),

        files: files.map((file) => ({
            path: file.path,
            size: file.size,
            sha: file.sha,
            extension: getFileExtension(file.path)
        }))
    };
}


/**
 * List repository files.
 */
export async function listRepositoryFiles({
    accessToken,
    owner,
    repo
}) {
    const repository = await getRepository({
        accessToken,
        owner,
        repo
    });

    const branch = repository.default_branch;

    const tree = await getRepositoryTree({
        accessToken,
        owner,
        repo,
        branch
    });

    const treeItems = Array.isArray(tree?.tree) ? tree.tree : [];

    return treeItems
        .filter((item) => item.type === "blob")
        .filter((item) => !isIgnoredPath(item.path))
        .map((item) => ({
            path: item.path,
            size: item.size,
            sha: item.sha,
            extension: getFileExtension(item.path)
        }));
}


/**
 * Read a single repository file.
 */
export async function readRepositoryFile({
    accessToken,
    owner,
    repo,
    path
}) {
    const repository = await getRepository({
        accessToken,
        owner,
        repo
    });

    const branch = repository.default_branch;

    const file = await getRepositoryFile({
        accessToken,
        owner,
        repo,
        path,
        branch
    });

    if (Array.isArray(file)) {
        throw new Error(
            "The requested path is a directory. Please provide a file path."
        );
    }

    if (file.type !== "file") {
        throw new Error("Requested path is not a file.");
    }

    if (!file.content) {
        return {
            path: file.path,
            content: null,
            message: "GitHub did not return file content."
        };
    }

    const content = Buffer
        .from(file.content, "base64")
        .toString("utf-8");

    return {
        path: file.path,
        sha: file.sha,
        size: file.size,
        content
    };
}


/**
 * Search repository code.
 */
export async function searchRepository({
    accessToken,
    owner,
    repo,
    query
}) {
    if (!query || !query.trim()) {
        throw new Error("Search query is required.");
    }

    const result = await searchRepositoryCode({
        accessToken,
        owner,
        repo,
        query: query.trim()
    });

    return {
        totalCount: result.total_count,

        results: result.items.map((item) => ({
            name: item.name,
            path: item.path,
            sha: item.sha,
            url: item.html_url
        }))
    };
}


/**
 * Detect basic project information.
 */
export async function detectProjectType({
    accessToken,
    owner,
    repo
}) {
    const repository = await getRepository({
        accessToken,
        owner,
        repo
    });

    const branch = repository.default_branch;

    const tree = await getRepositoryTree({
        accessToken,
        owner,
        repo,
        branch
    });

    const treeItems = Array.isArray(tree?.tree) ? tree.tree : [];

    const paths = treeItems
        .filter((item) => item.type === "blob")
        .map((item) => item.path);

    const has = (fileName) =>
        paths.some((path) =>
            path === fileName ||
            path.endsWith(`/${fileName}`)
        );

    let projectType = "unknown";

    if (has("next.config.js") || has("next.config.mjs")) {
        projectType = "nextjs";
    } else if (
        has("vite.config.js") ||
        has("vite.config.mjs")
    ) {
        projectType = "vite";
    } else if (has("package.json")) {
        projectType = "node";
    } else if (
        has("requirements.txt") ||
        has("pyproject.toml")
    ) {
        projectType = "python";
    } else if (has("pom.xml")) {
        projectType = "java-maven";
    } else if (has("go.mod")) {
        projectType = "go";
    } else if (has("Cargo.toml")) {
        projectType = "rust";
    } else if (paths.some((path) => path.endsWith(".csproj"))) {
        projectType = "dotnet";
    }

    return {
        projectType,
        defaultBranch: branch,
        githubLanguage: repository.language,
        detectedFiles: {
            packageJson: has("package.json"),
            requirementsTxt: has("requirements.txt"),
            pyprojectToml: has("pyproject.toml"),
            dockerfile: has("Dockerfile"),
            readme: has("README.md")
        }
    };
}