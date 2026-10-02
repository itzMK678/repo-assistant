import { testDatabaseConnection } from "../config/database.js";

export const getHealthStatus = async () => {
  const database = await testDatabaseConnection();

  return {
    status: "ok",
    service: "ai-software-engineer-backend",
    timestamp: new Date().toISOString(),
    database: {
      status: "connected",
      serverTime: database.current_time
    }
  };
};