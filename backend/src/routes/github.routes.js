import { Router } from "express";

import {
  githubLogin,
  githubCallback,
  githubRepositories,
  githubLogout,
} from "../controllers/github.controller.js";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/login",
  githubLogin
);

router.get(
  "/callback",
  githubCallback
);

router.get(
  "/repos",
  requireAuth,
  githubRepositories
);

router.post(
  "/logout",
  requireAuth,
  githubLogout
);

export default router;