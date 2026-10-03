import { pool } from "../config/database.js";
import {
  generateToken,
  hashToken,
} from "../utils/crypto.js";

const SESSION_DAYS = 7;

export async function createSession(userId) {
  const rawToken = generateToken();

  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date(
    Date.now() +
      SESSION_DAYS * 24 * 60 * 60 * 1000
  );

  await pool.query(
    `
    INSERT INTO sessions (
      user_id,
      session_token_hash,
      expires_at
    )
    VALUES ($1, $2, $3)
    `,
    [
      userId,
      tokenHash,
      expiresAt,
    ]
  );

  return {
    token: rawToken,
    expiresAt,
  };
}


export async function getUserFromSession(
  rawToken
) {
  if (!rawToken) {
    return null;
  }

  const tokenHash = hashToken(rawToken);

  const result = await pool.query(
    `
    SELECT
      u.id,
      u.created_at,
      s.id AS session_id
    FROM sessions s
    JOIN users u
      ON u.id = s.user_id
    WHERE s.session_token_hash = $1
      AND s.expires_at > NOW()
    LIMIT 1
    `,
    [tokenHash]
  );

  return result.rows[0] || null;
}


export async function deleteSession(rawToken) {
  if (!rawToken) {
    return;
  }

  const tokenHash = hashToken(rawToken);

  await pool.query(
    `
    DELETE FROM sessions
    WHERE session_token_hash = $1
    `,
    [tokenHash]
  );
}