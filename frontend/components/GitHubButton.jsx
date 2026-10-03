"use client";

import { getGithubLoginUrl } from "../lib/api";

export default function GitHubButton() {
  function handleLogin() {
    window.location.href =
      getGithubLoginUrl();
  }

  return (
    <button
      onClick={handleLogin}
      className="
        flex items-center gap-3
        rounded-lg
        bg-black
        px-5 py-3
        font-medium text-white
        transition
        hover:bg-gray-800
      "
    >
      <span className="text-xl">
        GitHub
      </span>

      <span>
        Connect GitHub
      </span>
    </button>
  );
}