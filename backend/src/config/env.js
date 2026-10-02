import dotenv from "dotenv";

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.DATABASE_URL,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000"
};

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is not defined in the environment.");
}

export default env;