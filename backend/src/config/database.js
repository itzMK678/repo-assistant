import pg from "pg";
import env from "./env.js";

const { Pool } = pg;

const pool = new Pool({
  connectionString: env.databaseUrl
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

export const query = (text, params) => {
  return pool.query(text, params);
};

export const testDatabaseConnection = async () => {
  const result = await pool.query("SELECT NOW() AS current_time");

  return result.rows[0];
};

export default pool;