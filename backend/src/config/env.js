import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
  "DATABASE_URL",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "GITHUB_CALLBACK_URL",
  "FRONTEND_URL",
  "SESSION_SECRET",
  "ENCRYPTION_KEY",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

if (process.env.ENCRYPTION_KEY.length !== 64) {
  throw new Error(
    "ENCRYPTION_KEY must contain 64 hexadecimal characters."
  );
}

export const env = {
  port: Number(process.env.PORT || 5000),
  PORT: Number(process.env.PORT || 5000),

  databaseUrl: process.env.DATABASE_URL,

  frontendUrl: process.env.FRONTEND_URL,

  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackUrl: process.env.GITHUB_CALLBACK_URL,
  },

  sessionSecret: process.env.SESSION_SECRET,

  encryptionKey: process.env.ENCRYPTION_KEY,

   DOCKER_SANDBOX_IMAGE:
        process.env.DOCKER_SANDBOX_IMAGE || "repoassistant-sandbox-node",

    SANDBOX_TIMEOUT_MS:
        Number(process.env.SANDBOX_TIMEOUT_MS || 60000),

    SANDBOX_MEMORY_MB:
        Number(process.env.SANDBOX_MEMORY_MB || 512),

    SANDBOX_CPU_COUNT:
        Number(process.env.SANDBOX_CPU_COUNT || 1),

    SANDBOX_PIDS_LIMIT:
        Number(process.env.SANDBOX_PIDS_LIMIT || 128),

        // =========================
    // AI
    // =========================

    AI_PROVIDER:
        process.env.AI_PROVIDER || "nebius",

    NEBIUS_BASE_URL:
        process.env.NEBIUS_BASE_URL,

    NEBIUS_API_KEY:
        process.env.NEBIUS_API_KEY,

    NEBIUS_MODEL:
        process.env.NEBIUS_MODEL,


    // =========================
    // AGENT LIMITS
    // =========================

    MAX_AGENT_ITERATIONS:
        Number(
            process.env.MAX_AGENT_ITERATIONS || 12
        ),

    MAX_AGENT_TOOL_CALLS:
        Number(
            process.env.MAX_AGENT_TOOL_CALLS || 30
        ),

    MAX_AGENT_COMMANDS:
        Number(
            process.env.MAX_AGENT_COMMANDS || 15
        ),

    MAX_AGENT_EXECUTION_TIME_MS:
        Number(
            process.env.MAX_AGENT_EXECUTION_TIME_MS || 300000
        ),

    MAX_AGENT_OUTPUT_SIZE:
        Number(
            process.env.MAX_AGENT_OUTPUT_SIZE || 20000
        ),

    MAX_AGENT_CHANGED_FILES:
        Number(
            process.env.MAX_AGENT_CHANGED_FILES || 30
        ),

    MAX_AGENT_FILE_SIZE:
        Number(
            process.env.MAX_AGENT_FILE_SIZE || 1000000
        ),
};