import express from "express";

import {
    dockerHealth,
    runSandbox,
} from "../controllers/sandbox.controller.js";

const router = express.Router();

router.get(
    "/health",
    dockerHealth
);

router.post(
    "/run",
    runSandbox
);

export default router;