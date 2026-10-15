import {
    runAgent,
} from "../services/agent/agent.service.js";

import {
    prepareRepositoryWorkspace,
} from "../services/agent/repository-workspace.service.js";

import {
    getGithubAccessToken,
    createBranch,
    commitAndPushFiles,
    createPullRequest,
} from "../services/github/github.service.js";

export async function runAgentController(
    req,
    res,
    next
) {
    try {
        const {
            task,
            repository,
            workspacePath,
            files,
        } = req.body;

        if (!task || !task.trim()) {
            return res.status(400).json({
                success: false,
                message: "task is required",
            });
        }

        const resolvedWorkspacePath = await prepareRepositoryWorkspace({
            repository,
            workspacePath,
            userId: req.user?.id,
            initialFiles: files,
        });

        const result =
            await runAgent({
                task,
                repository,
                workspacePath: resolvedWorkspacePath,
            });

        res.json({
            success: true,
            result,
        });
    } catch (error) {
        next(error);
    }
}

export async function publishAgentChangesController(
    req,
    res,
    next
) {
    try {
        const {
            owner,
            repo,
            branchName,
            title,
            summary,
            files,
        } = req.body;

        if (!owner || !repo) {
            return res.status(400).json({
                success: false,
                message: "owner and repo are required",
            });
        }

        if (!Array.isArray(files) || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No changed files provided to publish",
            });
        }

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required to publish to GitHub",
            });
        }

        const accessToken = await getGithubAccessToken(userId);

        const safeBranch =
            branchName ||
            `repoassistant/task-${Date.now().toString(36)}`;

        const commitTitle =
            title || "Apply AI Agent improvements via RepoAssistant";

        // 1. Create a task branch on GitHub
        await createBranch({
            accessToken,
            owner,
            repo,
            branchName: safeBranch,
        });

        // 2. Commit and push changed files
        const commitResults = await commitAndPushFiles({
            accessToken,
            owner,
            repo,
            branchName: safeBranch,
            files,
            commitMessage: commitTitle,
        });

        // 3. Create a GitHub Pull Request
        const pullRequest = await createPullRequest({
            accessToken,
            owner,
            repo,
            title: commitTitle,
            body:
                summary ||
                "Changes generated, tested in sandbox, and verified by RepoAssistant AI Agent.",
            head: safeBranch,
        });

        res.json({
            success: true,
            branch: safeBranch,
            commits: commitResults,
            pullRequest,
        });
    } catch (error) {
        next(error);
    }
}