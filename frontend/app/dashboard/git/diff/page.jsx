"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DiffViewer from "@/components/git/DiffViewer";

export default function DiffPage() {
  const [files, setFiles] = useState([]);
  const [taskName, setTaskName] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("repoassistant_active_task");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.result?.files) {
          setFiles(parsed.result.files);
        }
        if (parsed?.task) {
          setTaskName(parsed.task);
        }
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard/git"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Git Workflow
        </Link>

        <h1 className="mt-6 text-3xl font-bold">Review Code Diff</h1>
        <p className="my-3 text-slate-400">
          {taskName
            ? `Proposed changes for task: "${taskName}"`
            : "Inspect proposed changes before approving them."}
        </p>

        <DiffViewer files={files} />

        <div className="mt-6 flex items-center gap-4">
          <Link
            href="/dashboard/git/approval"
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
          >
            Continue to Approval →
          </Link>

          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-700 px-5 py-3 text-sm text-slate-300 hover:bg-slate-900"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
