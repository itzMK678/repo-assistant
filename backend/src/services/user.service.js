import { pool } from "../config/database.js";

export async function findUserByGithubId(
  githubUserId
) {
  const result = await pool.query(
    `
    SELECT
      u.id,
      u.created_at
    FROM users u
    JOIN github_accounts ga
      ON ga.user_id = u.id
    WHERE ga.github_user_id = $1
    LIMIT 1
    `,
    [githubUserId]
  );

  return result.rows[0] || null;
}


export async function createUser() {
  const result = await pool.query(
    `
    INSERT INTO users DEFAULT VALUES
    RETURNING id, created_at
    `
  );

  return result.rows[0];
}