"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import TestStatus from "@/components/testing/TestStatus";
import TestSummary from "@/components/testing/TestSummary";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const initialResults = [
  {
    id: "backend",
    title: "Backend connectivity",
    status: "pending",
    details: "Waiting to check the Express API.",
  },
  {
    id: "database",
    title: "Neon PostgreSQL",
    status: "pending",
    details: "Verify through the backend health response.",
  },
  {
    id: "github",
    title: "GitHub OAuth and repositories",
    status: "pending",
    details: "Full authentication flow needs a separate test.",
  },
  {
    id: "repository",
    title: "Repository analyzer",
    status: "pending",
    details: "File listing and reading need verification.",
  },
  {
    id: "sandbox",
    title: "Docker sandbox",
    status: "pending",
    details: "Container execution needs a separate test.",
  },
  {
    id: "agent",
    title: "AI agent",
    status: "pending",
    details: "Agent execution needs a separate test.",
  },
  {
    id: "git",
    title: "Git publishing workflow",
    status: "pending",
    details: "Diff, approval, push and PR need verification.",
  },
];

export default function TestingPage() {
  const [results, setResults] = useState(initialResults);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState("");

  const updateResult = useCallback((id, changes) => {
    setResults((current) =>
      current.map((item) =>
        item.id === id ? { ...item, ...changes } : item
      )
    );
  }, []);

  const checkBackend = useCallback(async () => {
    setChecking(true);

    updateResult("backend", {
      status: "running",
      details: "Requesting /api/health...",
    });

    updateResult("database", {
      status: "running",
      details: "Checking the health response for database status...",
    });

    try {
      const response = await fetch(`${API_URL}/api/health`, {
        signal: AbortSignal.timeout(10000),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(`Backend returned HTTP ${response.status}`);
      }

      updateResult("backend", {
        status: "passed",
        details: `Health endpoint responded with HTTP ${response.status}.`,
      });

      // Adapt check to actual health.service.js response shape: { success: true, data: { database: { status: "connected" } } }
      const dataObj = body?.data || body;
      const databaseHealthy =
        dataObj?.database === "connected" ||
        dataObj?.database === "healthy" ||
        dataObj?.database === "ok" ||
        dataObj?.database?.status === "connected" ||
        dataObj?.database?.status === "healthy" ||
        dataObj?.database?.status === "ok";

      updateResult("database", {
        status: databaseHealthy ? "passed" : "pending",
        details: databaseHealthy
          ? "The health response reports a healthy database connection."
          : `Backend responded, but database health could not be confirmed. Response: ${JSON.stringify(body).slice(0, 180)}`,
      });
    } catch (error) {
      updateResult("backend", {
        status: "failed",
        details: error.message || "Could not reach the backend.",
      });

      updateResult("database", {
        status: "failed",
        details: "Database health could not be verified.",
      });
    } finally {
      setLastChecked(new Date().toLocaleTimeString());
      setChecking(false);
    }
  }, [updateResult]);

  useEffect(() => {
    checkBackend();
  }, [checkBackend]);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Dashboard
        </Link>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Phase 8 Testing
            </h1>
            <p className="mt-2 text-slate-400">
              Verify RepoAssistant before declaring Layer 1 complete.
            </p>
          </div>

          <button
            onClick={checkBackend}
            disabled={checking}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500 disabled:opacity-50"
          >
            {checking ? "Checking..." : "Check Backend"}
          </button>
        </div>

        <div className="mt-8">
          <TestSummary results={results} />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {results.map((result) => (
            <TestStatus key={result.id} {...result} />
          ))}
        </div>

        {lastChecked && (
          <p className="mt-5 text-sm text-slate-500">
            Last checked: {lastChecked}
          </p>
        )}

        <p className="mt-6 text-sm text-amber-300">
          This dashboard does not execute the full automated test suite.
          Pending items must be tested separately.
        </p>
      </div>
    </main>
  );
}
