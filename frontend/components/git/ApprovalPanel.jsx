"use client";

import { useState } from "react";

export default function ApprovalPanel({ onApprove, onReject }) {
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState("");

  async function handleDecision(action) {
    const confirmed = window.confirm(
      action === "approve"
        ? "Approve these changes for publishing?"
        : "Reject these proposed changes?"
    );

    if (!confirmed) return;

    setLoading(true);
    setDecision("");

    try {
      if (action === "approve") {
        await onApprove?.();
      } else {
        await onReject?.();
      }

      setDecision(action);
    } catch (error) {
      window.alert(error.message || "The operation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-white">
      <h2 className="text-xl font-semibold">Review Decision</h2>

      <p className="mt-2 text-sm text-slate-400">
        Review the full diff before making your decision.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => handleDecision("approve")}
          className="rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-500 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Approve Changes"}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleDecision("reject")}
          className="rounded-lg bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Reject Changes"}
        </button>
      </div>

      {decision && (
        <p className="mt-4 text-sm text-slate-300">
          {decision === "approve"
            ? "✓ Approval request completed."
            : "✕ Rejection request completed."}
        </p>
      )}
    </div>
  );
}
