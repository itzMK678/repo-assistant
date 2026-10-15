"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ApprovalPanel from "@/components/git/ApprovalPanel";
import { publishChanges } from "@/lib/api";

export default function ApprovalPage() {
  const [activeTask, setActiveTask] = useState(null);
  const [publishResult, setPublishResult] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("repoassistant_active_task");
      if (stored) {
        setActiveTask(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  async function approveChanges() {
    if (!activeTask || !activeTask.result?.files?.length) {
      throw new Error(
        "No active agent task found to publish. Please run an agent task on the dashboard first."
      );
    }

    const response = await publishChanges({
      owner: activeTask.repository.owner,
      repo: activeTask.repository.name,
      title: `repoassistant: ${activeTask.task.slice(0, 50)}`,
      summary:
        activeTask.result?.result?.finalMessage ||
        `Changes generated and verified in Docker sandbox for task: ${activeTask.task}`,
      files: activeTask.result.files,
    });

    if (!response.success) {
      throw new Error(response.message || "Failed to publish changes.");
    }

    setPublishResult(response);
    if (typeof window !== "undefined") {
      localStorage.setItem("repoassistant_published_pr", JSON.stringify(response));
    }
  }

  async function rejectChanges() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("repoassistant_active_task");
    }
    setActiveTask(null);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/git"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Git Workflow
        </Link>

        <h1 className="mt-6 text-3xl font-bold">Approve Changes</h1>
        <p className="mt-2 text-slate-400">
          Review the proposed changes and choose whether to proceed with branching, committing, and opening a Pull Request.
        </p>

        {activeTask && (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
            <p>
              Repository:{" "}
              <strong className="text-white">
                {activeTask.repository?.owner}/{activeTask.repository?.name}
              </strong>
            </p>
            <p className="mt-1">
              Task: <em>&quot;{activeTask.task}&quot;</em>
            </p>
            <p className="mt-1">
              Files modified: <strong>{activeTask.result?.files?.length || 0}</strong>
            </p>
          </div>
        )}

        <div className="mt-6">
          <ApprovalPanel
            onApprove={approveChanges}
            onReject={rejectChanges}
          />
        </div>

        {publishResult && (
          <div className="mt-6 rounded-xl border border-green-800 bg-green-950/40 p-5 text-green-300">
            <h3 className="font-bold">🎉 Published to GitHub!</h3>
            <p className="mt-1 text-sm">
              Branch: <span className="font-mono">{publishResult.branch}</span>
            </p>
            {publishResult.pullRequest?.htmlUrl && (
              <a
                href={publishResult.pullRequest.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-500"
              >
                View Pull Request on GitHub →
              </a>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/dashboard/git/pull-request"
            className="text-sm text-blue-400 hover:underline"
          >
            Go to Pull Request Status →
          </Link>
          <span className="text-slate-600">•</span>
          <Link
            href="/dashboard"
            className="text-sm text-slate-400 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
