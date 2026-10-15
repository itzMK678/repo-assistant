import express from "express";

import {
    runAgentController,
    publishAgentChangesController,
} from "../controllers/agent.controller.js";

import {
    requireAuth,
    optionalAuth,
} from "../middleware/auth.middleware.js";

const router =
    express.Router();

router.post(
    "/run",
    optionalAuth,
    runAgentController
);

router.post(
    "/publish",
    requireAuth,
    publishAgentChangesController
);

export default router;