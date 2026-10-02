import express from "express";
import cors from "cors";

import env from "./config/env.js";
import healthRoutes from "./routes/health.routes.js";
import {
  notFoundHandler,
  errorHandler
} from "./middleware/error.middleware.js";

const app = express();

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

app.use("/api/health", healthRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;