"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GitWorkflowStatus from "@/components/git/GitWorkflowStatus";

export default function PullRequestPage() {
  const [publishedPr, setPublishedPr] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => {
    try {
      const prStr = localStorage.getItem("repoassistant_published_pr");
      if (prStr) setPublishedPr(JSON.parse(prStr));

      const taskStr = localStorage.getItem("repoassistant_active_task");
      if (taskStr) setActiveTask(JSON.parse(taskStr));
    } catch {
      // ignore
    }
  }, []);

  const completedStages = publishedPr
    ? [
        "Diff generated",
        "Changes approved",
        "Branch created",
        "Changes committed",
        "Changes pushed",
        "Pull request created",
      ]
    : activeTask
    ? ["Diff generated"]
    : [];

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/git"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Git Workflow
        </Link>

        <h1 className="mt-6 text-3xl font-bold">Pull Request Status</h1>

        <p className="mt-2 text-slate-400">
          Track the Git publishing process for your repository task.
        </p>

        <div className="mt-8">
          <GitWorkflowStatus completed={completedStages} />
        </div>

        {publishedPr ? (
          <div className="mt-6 rounded-xl border border-green-800 bg-green-950/40 p-6">
            <h2 className="text-lg font-bold text-green-300">
              ✓ Pull Request Active on GitHub
            </h2>
            <div className="mt-3 space-y-1 text-sm text-slate-300">
              <p>
                Branch: <span className="font-mono text-white">{publishedPr.branch}</span>
              </p>
              {publishedPr.pullRequest?.title && (
                <p>
                  Title: <strong className="text-white">{publishedPr.pullRequest.title}</strong>
                </p>
              )}
            </div>

            {publishedPr.pullRequest?.htmlUrl && (
              <a
                href={publishedPr.pullRequest.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-green-500"
              >
                <span>View Pull Request #{publishedPr.pullRequest.number} on GitHub</span>
                <span>↗</span>
              </a>
            )}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="font-semibold text-slate-300">
              No Pull Request Created Yet
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Select a repository, run an agent task, review the diff, and approve the changes
              to automatically generate a GitHub Pull Request.
            </p>
            <div className="mt-4">
              <Link
                href="/dashboard"
                className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
