import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-6 text-white">
      <div className="w-full max-w-3xl text-center">
        <p className="mb-4 text-sm font-medium text-gray-400">
          AI SOFTWARE ENGINEER
        </p>

        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Your AI Coding Agent
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
          Connect GitHub repositories, give coding tasks to an AI agent,
          review the generated changes, and create Pull Requests with
          human approval.
        </p>

        <div className="mt-8">
          <Link
            href="/dashboard"
            className="inline-flex rounded-lg bg-white px-6 py-3 font-semibold text-gray-950 transition hover:bg-gray-200"
          >
            Open Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}