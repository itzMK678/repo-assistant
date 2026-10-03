import {
    executeInSandbox,
} from "../services/sandbox/sandbox.service.js";

import {
    checkDockerConnection,
} from "../services/sandbox/docker.service.js";

export async function dockerHealth(
    req,
    res,
    next
) {
    try {
        const result =
            await checkDockerConnection();

        res.json({
            success: true,
            docker: result,
        });
    } catch (error) {
        next(error);
    }
}

export async function runSandbox(
    req,
    res,
    next
) {
    try {
        const {
            files,
            command,
        } = req.body;

        const result =
            await executeInSandbox({
                files,
                command,
            });

        res.json({
            success: true,
            result,
        });
    } catch (error) {
        next(error);
    }
}
