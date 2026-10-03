import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";

import healthRoutes from "./routes/health.routes.js";
import githubRoutes from "./routes/github.routes.js";
import repositoryRoutes from "./routes/repository.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import sandboxRoutes from "./routes/sandbox.routes.js";

import {
  notFoundHandler,
  errorHandler
} from "./middleware/error.middleware.js";

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Software Engineer API is running"
  });
});

app.use("/api/agent",agentRoutes);

app.use("/api/health", healthRoutes);

app.use("/api/github",githubRoutes);

app.use("/api/repositories", repositoryRoutes);

app.use("/api/sandbox",sandboxRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;