
import Link from "next/link";
import DiffViewer from "@/components/git/DiffViewer";

export default function DiffPage() {
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
          Inspect proposed changes before approving them.
        </p>

        <DiffViewer files={[]} />

        <Link
          href="/dashboard/git/approval"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 hover:bg-blue-500"
        >
          Continue to Approval
        </Link>
      </div>
    </main>
  );
}
