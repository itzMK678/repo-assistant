"use client";

import { useState } from "react";
import { runAgentTask, publishChanges } from "../lib/api";
import DiffViewer from "./git/DiffViewer";

export default function AgentTaskRunner({ repository }) {
  const [task, setTask] = useState("");
  const [status, setStatus] = useState("idle"); // idle | running | completed | failed
  const [stepMessage, setStepMessage] = useState("");
  const [agentResult, setAgentResult] = useState(null);
  const [error, setError] = useState("");
  const [showDiff, setShowDiff] = useState(false);
  const [openTools, setOpenTools] = useState(false);

  // Approval & Publishing state
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [prTitle, setPrTitle] = useState("");
  const [prSummary, setPrSummary] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(null);
  const [publishError, setPublishError] = useState("");

  const suggestions = [
    "Inspect the repository structure and verify build status",
    "Find bugs or failing tests, fix them, and run tests",
    "Add a unit test suite for the main logic",
  ];

  async function handleRunAgent(taskText = task) {
    const promptToRun = taskText.trim();
    if (!promptToRun) {
      setError("Please describe what task you want the AI agent to execute.");
      return;
    }

    try {
      setStatus("running");
      setError("");
      setAgentResult(null);
      setPublishSuccess(null);
      setPublishError("");
      setShowDiff(false);

      setStepMessage("Preparing isolated workspace and loading repository files...");

      const timer = setTimeout(() => {
        setStepMessage("Agent analyzing files and executing tools in Docker sandbox...");
      }, 3000);

      const response = await runAgentTask({
        task: promptToRun,
        repository: {
          owner: repository.owner,
          name: repository.name,
          defaultBranch: repository.defaultBranch,
        },
      });

      clearTimeout(timer);

      if (!response.success || !response.result) {
        throw new Error(response.message || "Agent execution failed.");
      }

      setAgentResult(response.result);
      setStatus(response.result.success ? "completed" : "failed");

      // Save to localStorage for Git Workflow pages
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "repoassistant_active_task",
          JSON.stringify({
            repository,
            task: promptToRun,
            result: response.result,
            timestamp: new Date().toISOString(),
          })
        );
      }

      // Default PR title & summary
      setPrTitle(`repoassistant: ${promptToRun.slice(0, 50)}`);
      setPrSummary(
        response.result.result?.finalMessage ||
          `Automated changes verified and tested in Docker sandbox for task: ${promptToRun}`
      );
    } catch (err) {
      setError(err.message || "Failed to execute agent task.");
      setStatus("failed");
    } finally {
      setStepMessage("");
    }
  }

  async function handleConfirmPublish() {
    if (!agentResult || !agentResult.files || agentResult.files.length === 0) {
      setPublishError("No changed files available to commit.");
      return;
    }

    try {
      setIsPublishing(true);
      setPublishError("");

      const response = await publishChanges({
        owner: repository.owner,
        repo: repository.name,
        title: prTitle.trim() || `AI Agent update for: ${task.slice(0, 40)}`,
        summary: prSummary.trim(),
        files: agentResult.files,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to publish changes to GitHub.");
      }

      setPublishSuccess(response);
      setShowPublishModal(false);
    } catch (err) {
      setPublishError(err.message || "Failed to create branch and Pull Request on GitHub.");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-blue-900/40 bg-slate-900/90 p-6 text-white shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-blue-500 animate-pulse"></span>
            <h2 className="text-xl font-bold">AI Agent Assistant</h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Instruct the agent to inspect, add, or fix code in{" "}
            <span className="font-mono text-blue-400">
              {repository.owner}/{repository.name}
            </span>{" "}
            with isolated Docker sandbox testing.
          </p>
        </div>

        {status === "completed" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-950/60 border border-green-800 px-3 py-1 text-xs font-semibold text-green-300">
            ✓ Task Complete
          </span>
        )}
      </div>

      {/* Task input area */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-slate-300">
          What would you like the agent to do?
        </label>

        <textarea
          rows={3}
          value={task}
          disabled={status === "running"}
          onChange={(e) => setTask(e.target.value)}
          placeholder="e.g. Fix failing tests in math module, verify in sandbox, and format result..."
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        />

        {/* Suggestions */}
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={status === "running"}
              onClick={() => {
                setTask(suggestion);
                handleRunAgent(suggestion);
              }}
              className="rounded-full border border-slate-800 bg-slate-950/70 px-3 py-1 text-xs text-slate-400 transition hover:border-blue-500 hover:text-blue-300 disabled:opacity-40"
            >
              💡 {suggestion}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            disabled={status === "running" || !task.trim()}
            onClick={() => handleRunAgent()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-blue-500 disabled:opacity-50"
          >
            {status === "running" ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Running Agent...</span>
              </>
            ) : (
              <span>⚡ Execute Agent Task</span>
            )}
          </button>

          {status === "running" && (
            <span className="text-sm text-slate-400 animate-pulse">
              {stepMessage || "Processing in sandbox..."}
            </span>
          )}
        </div>
      </div>

      {/* Execution Results View */}
      {agentResult && (
        <div className="mt-8 space-y-6 border-t border-slate-800 pt-6">
          {/* Solution Summary Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Agent Execution Summary</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Iterations: <strong>{agentResult.result?.iterations || 1}</strong></span>
                <span>•</span>
                <span>Tool Calls: <strong>{agentResult.result?.toolCalls || agentResult.toolResults?.length || 0}</strong></span>
                <span>•</span>
                <span>Files Changed: <strong>{agentResult.changedFiles?.length || 0}</strong></span>
              </div>
            </div>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
              {agentResult.result?.finalMessage || "Task completed successfully."}
            </p>
          </div>

          {/* Action Row: Diff Inspection & Permission to Push */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDiff(!showDiff)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                {showDiff ? "Hide Code Diff" : "🔍 Inspect Code Diff"}
                {agentResult.files?.length > 0 && ` (${agentResult.files.length})`}
              </button>

              {agentResult.toolResults?.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOpenTools(!openTools)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
                >
                  {openTools ? "Hide Tool Execution Steps" : "🐳 View Docker / Tool Steps"}
                  {` (${agentResult.toolResults.length})`}
                </button>
              )}
            </div>

            {/* Permission to Push Button */}
            {agentResult.files?.length > 0 && !publishSuccess && (
              <button
                type="button"
                onClick={() => setShowPublishModal(true)}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-xs font-semibold text-white shadow transition hover:bg-green-500"
              >
                🚀 Approve & Push to GitHub
              </button>
            )}
          </div>

          {/* Publish Success Notice */}
          {publishSuccess && (
            <div className="rounded-xl border border-green-800 bg-green-950/40 p-5 text-green-300">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold">🎉 Changes Successfully Published to GitHub!</h4>
                  <p className="mt-1 text-sm text-green-400">
                    Created branch: <span className="font-mono font-semibold">{publishSuccess.branch}</span>
                  </p>
                  {publishSuccess.pullRequest?.htmlUrl && (
                    <p className="mt-1 text-sm">
                      Pull Request:{" "}
                      <a
                        href={publishSuccess.pullRequest.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold underline hover:text-white"
                      >
                        {publishSuccess.pullRequest.title} (#{publishSuccess.pullRequest.number}) →
                      </a>
                    </p>
                  )}
                </div>

                {publishSuccess.pullRequest?.htmlUrl && (
                  <a
                    href={publishSuccess.pullRequest.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-500"
                  >
                    Open PR on GitHub ↗
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Inline Diff Viewer */}
          {showDiff && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-300">Proposed Code Changes (Diff):</h4>
              <DiffViewer files={agentResult.files || []} />
            </div>
          )}

          {/* Tool Calls Accordion */}
          {openTools && agentResult.toolResults?.length > 0 && (
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <h4 className="text-sm font-semibold text-slate-300">Tool Calls & Docker Sandbox Execution:</h4>
              <div className="space-y-2">
                {agentResult.toolResults.map((t, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs font-mono">
                    <div className="flex items-center justify-between text-blue-400 font-semibold">
                      <span>Step {idx + 1}: {t.tool}</span>
                      <span className={t.result?.success !== false ? "text-green-400" : "text-red-400"}>
                        {t.result?.success !== false ? "✓ Success" : "✕ Error"}
                      </span>
                    </div>

                    {t.arguments && (
                      <div className="mt-1 text-slate-400">
                        Args: {JSON.stringify(t.arguments)}
                      </div>
                    )}

                    {t.result?.stdout && (
                      <div className="mt-2 rounded bg-black p-2 font-mono text-xs text-green-300 whitespace-pre-wrap">
                        {t.result.stdout}
                      </div>
                    )}

                    {t.result?.stderr && (
                      <div className="mt-1 rounded bg-black p-2 font-mono text-xs text-red-300 whitespace-pre-wrap">
                        {t.result.stderr}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Permission & Approval Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl">
            <h3 className="text-xl font-bold">Approve Changes & Push to GitHub</h3>
            <p className="mt-2 text-sm text-slate-400">
              Confirm your permission to create a branch, commit the agent&apos;s modified files,
              and open a Pull Request on{" "}
              <span className="font-semibold text-blue-400">
                {repository.owner}/{repository.name}
              </span>.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Pull Request Title
                </label>
                <input
                  type="text"
                  value={prTitle}
                  onChange={(e) => setPrTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Summary / PR Description
                </label>
                <textarea
                  rows={3}
                  value={prSummary}
                  onChange={(e) => setPrSummary(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400">Files to commit:</span>
                <ul className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs font-mono text-slate-300">
                  {(agentResult?.files || []).map((f) => (
                    <li key={f.path} className="py-0.5">
                      • {f.path}
                    </li>
                  ))}
                </ul>
              </div>

              {publishError && (
                <div className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-xs text-red-300">
                  {publishError}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isPublishing}
                onClick={() => setShowPublishModal(false)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isPublishing}
                onClick={handleConfirmPublish}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-green-500 disabled:opacity-50"
              >
                {isPublishing ? (
                  <>
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Pushing & Creating PR...</span>
                  </>
                ) : (
                  <span>✓ Confirm & Push to GitHub</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
