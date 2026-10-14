import Link from "next/link";
import GitWorkflowStatus from "@/components/git/GitWorkflowStatus";

export default function PullRequestPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/git"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Git Workflow
        </Link>

        <h1 className="mt-6 text-3xl font-bold">Pull Request</h1>

        <p className="mt-2 text-slate-400">
          Track the Git publishing process for your repository task.
        </p>

        <div className="mt-8">
          <GitWorkflowStatus completed={[]} />
        </div>

        <div className="mt-6 rounded-xl border border-amber-800 bg-amber-950/30 p-5">
          <h2 className="font-semibold text-amber-300">
            GitHub PR Automation (Phase 8)
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            A real pull request will appear here once the branch is created, commits
            are generated from approved changes, and pushed to your remote repository.
          </p>
        </div>
      </div>
    </main>
  );
}
