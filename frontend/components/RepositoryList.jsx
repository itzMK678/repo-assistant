"use client";

import { useEffect, useState } from "react";

import {
  getRepositories,
} from "../lib/api";

export default function RepositoryList({
  onSelect,
}) {
  const [
    repositories,
    setRepositories,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    async function loadRepositories() {
      try {
        setLoading(true);

        const result =
          await getRepositories();

        setRepositories(
          result.data.repositories
        );
      } catch (err) {
        setError(
          err.message ||
          "Failed to load repositories."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRepositories();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        Loading repositories...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border p-6">
        <p className="text-red-500">
          {error}
        </p>
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className="rounded-lg border p-6">
        No repositories found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        Your repositories
      </h2>

      <div className="grid gap-4">
        {repositories.map(
          (repository) => (
            <button
              key={repository.id}
              onClick={() =>
                onSelect(repository)
              }
              className="
                rounded-xl
                border
                p-5
                text-left
                transition
                hover:bg-gray-50
              "
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {repository.fullName}
                </h3>

                <span className="text-xs">
                  {repository.private
                    ? "Private"
                    : "Public"}
                </span>
              </div>

              {repository.description && (
                <p className="mt-2 text-sm text-gray-600">
                  {repository.description}
                </p>
              )}

              <div className="mt-3 text-sm text-gray-500">
                {repository.language ||
                  "Unknown language"}
              </div>
            </button>
          )
        )}
      </div>
    </div>
  );
}