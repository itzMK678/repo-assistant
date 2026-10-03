import express from "express";

import {
    analyzeRepositoryController,
    listRepositoryFilesController,
    readRepositoryFileController,
    searchRepositoryController,
    detectProjectTypeController
} from "../controllers/repository.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuth);

router.get(
    "/:owner/:repo/analyze",
    analyzeRepositoryController
);

router.get(
    "/:owner/:repo/files",
    listRepositoryFilesController
);

router.get(
    "/:owner/:repo/file",
    readRepositoryFileController
);

router.get(
    "/:owner/:repo/search",
    searchRepositoryController
);

router.get(
    "/:owner/:repo/project-type",
    detectProjectTypeController
);

export default router;