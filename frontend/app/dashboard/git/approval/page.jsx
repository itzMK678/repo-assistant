"use client";

import Link from "next/link";
import ApprovalPanel from "@/components/git/ApprovalPanel";

export default function ApprovalPage() {
  async function approveChanges() {
    throw new Error(
      "Approval API is not connected yet. Connect the backend before approving."
    );
  }

  async function rejectChanges() {
    throw new Error(
      "Rejection API is not connected yet. Connect the backend before rejecting."
    );
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
          Review the proposed changes and choose whether to proceed with branching and committing.
        </p>

        <div className="mt-8">
          <ApprovalPanel
            onApprove={approveChanges}
            onReject={rejectChanges}
          />
        </div>
      </div>
    </main>
  );
}
