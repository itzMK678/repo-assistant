
import Link from "next/link";

const steps = [
  "Review code changes",
  "Approve changes",
  "Create branch",
  "Commit and push",
  "Create pull request",
];

export default function GitWorkflowPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold">Git Workflow</h1>
        <p className="mt-2 text-slate-400">
          Review, approve, and publish your repository changes.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Workflow</h2>

          <div className="mt-6 space-y-5">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center gap-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800">
                  {index + 1}
                </span>
                <span>{step}</span>
                <span className="ml-auto text-xs text-slate-500">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/dashboard/git/diff"
            className="rounded-xl border border-slate-800 bg-slate-900 p-5 hover:border-blue-500"
          >
            <h2 className="font-semibold">Review Diff</h2>
            <p className="mt-2 text-sm text-slate-400">
              Inspect changed files and lines.
            </p>
          </Link>

          <Link
            href="/dashboard/git/approval"
            className="rounded-xl border border-slate-800 bg-slate-900 p-5 hover:border-blue-500"
          >
            <h2 className="font-semibold">Approve Changes</h2>
            <p className="mt-2 text-sm text-slate-400">
              Approve or reject proposed changes.
            </p>
          </Link>

          <Link
            href="/dashboard/git/pull-request"
            className="rounded-xl border border-slate-800 bg-slate-900 p-5 hover:border-blue-500"
          >
            <h2 className="font-semibold">Pull Request</h2>
            <p className="mt-2 text-sm text-slate-400">
              View branch and pull-request details.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
