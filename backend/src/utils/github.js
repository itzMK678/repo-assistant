const GITHUB_API_URL = "https://api.github.com";

export async function githubRequest(
  endpoint,
  accessToken,
  options = {}
) {
  const response = await fetch(
    `${GITHUB_API_URL}${endpoint}`,
    {
      ...options,

      headers: {
        Accept: "application/vnd.github+json",

        Authorization: `Bearer ${accessToken}`,

        "X-GitHub-Api-Version": "2026-03-10",

        ...(options.headers || {}),
      },
    }
  );

  const text = await response.text();

  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const error = new Error(
      data?.message ||
      `GitHub API request failed with ${response.status}`
    );

    error.status = response.status;
    error.githubData = data;

    throw error;
  }

  return data;
}