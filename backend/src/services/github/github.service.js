
import axios from "axios";

import { pool } from "../../config/database.js";
import { env } from "../../config/env.js";
import { encrypt, decrypt } from "../../utils/crypto.js";

/* =========================================================
   GitHub API Client
   ========================================================= */

const GITHUB_API_URL = "https://api.github.com";

function createGitHubClient(accessToken) {
  if (!accessToken) {
    throw new Error("GitHub access token is required");
  }

  return axios.create({
    baseURL: GITHUB_API_URL,

    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },

    timeout: 15000,
  });
}


/* =========================================================
   GitHub OAuth
   ========================================================= */

/**
 * Create GitHub OAuth authorization URL.
 */
export function getGithubAuthorizationUrl(state) {
  const params = new URLSearchParams({
    client_id: env.github.clientId,
    redirect_uri: env.github.callbackUrl,
    scope: "read:user repo",
    state,
  });

  return (
    "https://github.com/login/oauth/authorize?" +
    params.toString()
  );
}


/**
 * Exchange GitHub OAuth authorization code
 * for an access token.
 */
export async function exchangeCodeForToken(code) {
  const response = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        client_id: env.github.clientId,
        client_secret: env.github.clientSecret,
        code,
        redirect_uri: env.github.callbackUrl,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    const error = new Error(
      data.error_description ||
        "Failed to exchange GitHub OAuth code."
    );

    error.status = 400;

    throw error;
  }

  return data;
}


/**
 * Get authenticated GitHub user.
 */
export async function getGithubUser(accessToken) {
  const github = createGitHubClient(accessToken);

  const response = await github.get("/user");

  return response.data;
}


/* =========================================================
   GitHub Account Database
   ========================================================= */

/**
 * Save or update a user's GitHub account.
 */
export async function saveGithubAccount({
  userId,
  githubUser,
  tokenData,
}) {
  const encryptedAccessToken = encrypt(
    tokenData.access_token
  );

  const encryptedRefreshToken =
    tokenData.refresh_token
      ? encrypt(tokenData.refresh_token)
      : null;

  const expiresAt = tokenData.expires_in
    ? new Date(
        Date.now() +
          tokenData.expires_in * 1000
      )
    : null;

  const refreshExpiresAt =
    tokenData.refresh_token_expires_in
      ? new Date(
          Date.now() +
            tokenData.refresh_token_expires_in *
              1000
        )
      : null;

  const scopes = tokenData.scope
    ? tokenData.scope.split(",")
    : [];


  /*
   * Check whether this user already has
   * a GitHub account connected.
   */
  const existingAccount = await pool.query(
    `
    SELECT id
    FROM github_accounts
    WHERE user_id = $1
    LIMIT 1
    `,
    [userId]
  );


  /*
   * User already has a GitHub account.
   * Replace it with the newly authenticated account.
   */
  if (existingAccount.rows.length > 0) {
    const result = await pool.query(
      `
      UPDATE github_accounts
      SET
        github_user_id = $2,
        github_login = $3,
        github_name = $4,
        github_avatar_url = $5,
        access_token_encrypted = $6,
        refresh_token_encrypted = $7,
        token_expires_at = $8,
        refresh_token_expires_at = $9,
        scopes = $10,
        updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
      `,
      [
        userId,
        githubUser.id,
        githubUser.login,
        githubUser.name,
        githubUser.avatar_url,
        encryptedAccessToken,
        encryptedRefreshToken,
        expiresAt,
        refreshExpiresAt,
        scopes,
      ]
    );

    return result.rows[0];
  }


  /*
   * Check whether this GitHub account belongs
   * to another RepoAssistant user.
   */
  const githubAccount = await pool.query(
    `
    SELECT id, user_id
    FROM github_accounts
    WHERE github_user_id = $1
    LIMIT 1
    `,
    [githubUser.id]
  );

  if (githubAccount.rows.length > 0) {
    const error = new Error(
      "This GitHub account is already connected to another RepoAssistant account."
    );

    error.status = 409;

    throw error;
  }


  /*
   * Create a new GitHub connection.
   */
  const result = await pool.query(
    `
    INSERT INTO github_accounts (
      user_id,
      github_user_id,
      github_login,
      github_name,
      github_avatar_url,
      access_token_encrypted,
      refresh_token_encrypted,
      token_expires_at,
      refresh_token_expires_at,
      scopes,
      updated_at
    )
    VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10, NOW()
    )
    RETURNING *
    `,
    [
      userId,
      githubUser.id,
      githubUser.login,
      githubUser.name,
      githubUser.avatar_url,
      encryptedAccessToken,
      encryptedRefreshToken,
      expiresAt,
      refreshExpiresAt,
      scopes,
    ]
  );

  return result.rows[0];
}


/**
 * Get decrypted GitHub access token.
 */
export async function getGithubAccessToken(userId) {
  const result = await pool.query(
    `
    SELECT access_token_encrypted
    FROM github_accounts
    WHERE user_id = $1
    LIMIT 1
    `,
    [userId]
  );

  if (!result.rows[0]) {
    throw new Error(
      "GitHub account is not connected."
    );
  }

  return decrypt(
    result.rows[0].access_token_encrypted
  );
}


/* =========================================================
   GitHub Repository Operations
   ========================================================= */

/**
 * Get repository information.
 */
export async function getRepository({
  accessToken,
  owner,
  repo,
}) {
  const github = createGitHubClient(accessToken);

  const response = await github.get(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
  );

  return response.data;
}


/**
 * Get the default branch of a repository.
 */
export async function getDefaultBranch({
  accessToken,
  owner,
  repo,
}) {
  const repository = await getRepository({
    accessToken,
    owner,
    repo,
  });

  return repository.default_branch;
}


/**
 * Get the complete Git tree recursively.
 */
export async function getRepositoryTree({
  accessToken,
  owner,
  repo,
  branch,
}) {
  const github = createGitHubClient(accessToken);

  const response = await github.get(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}`,
    {
      params: {
        recursive: "1",
      },
    }
  );

  return response.data;
}


/**
 * Read one file from a repository.
 */
export async function getRepositoryFile({
  accessToken,
  owner,
  repo,
  path,
  branch,
}) {
  const github = createGitHubClient(accessToken);

  const cleanPath = path ? path.replace(/^\/+/, "") : "";

  const encodedPath = cleanPath
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  const response = await github.get(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}`,
    {
      params: {
        ref: branch,
      },
    }
  );

  return response.data;
}


/**
 * Search code inside a GitHub repository.
 */
export async function searchRepositoryCode({
  accessToken,
  owner,
  repo,
  query,
}) {
  const github = createGitHubClient(accessToken);

  const response = await github.get(
    "/search/code",
    {
      params: {
        q: `${query} repo:${owner}/${repo}`,
      },
    }
  );

  return response.data;
}


/* =========================================================
   User Repositories
   ========================================================= */

/**
 * Get repositories belonging to/authenticated
 * GitHub user.
 */
export async function getRepositories(
  userId,
  page = 1
) {
  const accessToken =
    await getGithubAccessToken(userId);

  const github = createGitHubClient(
    accessToken
  );

  const response = await github.get(
    "/user/repos",
    {
      params: {
        per_page: 100,
        page,
        sort: "updated",
        direction: "desc",
      },
    }
  );

  return response.data.map((repo) => ({
    id: repo.id,

    name: repo.name,

    fullName: repo.full_name,

    owner: repo.owner.login,

    description: repo.description,

    private: repo.private,

    defaultBranch:
      repo.default_branch,

    htmlUrl:
      repo.html_url,

    language:
      repo.language,

    updatedAt:
      repo.updated_at,

    permissions:
      repo.permissions || null,
  }));
}

