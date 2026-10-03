const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export async function apiFetch(
  endpoint,
  options = {}
) {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,

      credentials: "include",

      headers: {
        "Content-Type":
          "application/json",

        ...(options.headers || {}),
      },
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Request failed."
    );
  }

  return data;
}


export function getGithubLoginUrl() {
  return `${API_URL}/api/github/login`;
}


export async function getRepositories() {
  return apiFetch(
    "/api/github/repos"
  );
}


export async function logoutGithub() {
  return apiFetch(
    "/api/github/logout",
    {
      method: "POST",
    }
  );
}


export async function getHealth() {
  return apiFetch("/api/health");
}


export async function analyzeRepository(owner, repo) {
    const response = await fetch(
        `${API_URL}/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/analyze`,
        {
            credentials: "include"
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to analyze repository."
        );
    }

    return data;
}


export async function getRepositoryFiles(owner, repo) {
    const response = await fetch(
        `${API_URL}/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/files`,
        {
            credentials: "include"
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to get repository files."
        );
    }

    return data;
}


export async function readRepositoryFile(
    owner,
    repo,
    path
) {
    const response = await fetch(
        `${API_URL}/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/file?path=${encodeURIComponent(path)}`,
        {
            credentials: "include"
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to read repository file."
        );
    }

    return data;
}


export async function searchRepository(
    owner,
    repo,
    query
) {
    const response = await fetch(
        `${API_URL}/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/search?q=${encodeURIComponent(query)}`,
        {
            credentials: "include"
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to search repository."
        );
    }

    return data;
}


export async function detectProjectType(owner, repo) {
    const response = await fetch(
        `${API_URL}/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/project-type`,
        {
            credentials: "include"
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to detect project type."
        );
    }

    return data;
}