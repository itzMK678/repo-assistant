import {
    runAgent,
} from "../services/agent/agent.service.js";

import {
    prepareRepositoryWorkspace,
} from "../services/agent/repository-workspace.service.js";

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