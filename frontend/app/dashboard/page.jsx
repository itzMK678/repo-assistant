"use client";
import Link from "next/link";
import { useState } from "react";

import RepositoryList from "../../components/RepositoryList";
import RepositoryAnalyzer from "../../components/RepositoryAnalyzer";
import BackendStatus from "../../components/BackendStatus";

export default function DashboardPage() {
  const [
    selectedRepository,
    setSelectedRepository,
  ] = useState(null);

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              RepoAssistant
            </h1>

            <p className="mt-2 text-gray-600">
              Select a repository to work with.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/git"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500"
            >
              Git Workflow →
            </Link>

            <div className="text-sm">
              <BackendStatus />
            </div>
          </div>
        </div>

        <RepositoryList
          onSelect={
            setSelectedRepository
          }
        />

        {selectedRepository && (
          <>
            <div className="mt-8 rounded-xl border p-6">
              <h2 className="text-xl font-semibold">
                Selected Repository
              </h2>

              <p className="mt-3">
                {
                  selectedRepository.fullName
                }
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Owner:{" "}
                {
                  selectedRepository.owner
                }
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Default branch:{" "}
                {
                  selectedRepository.defaultBranch
                }
              </p>
            </div>

            <RepositoryAnalyzer
              owner={selectedRepository.owner}
              repo={selectedRepository.name}
            />
          </>
        )}
      </div>
    </main>
  );
}