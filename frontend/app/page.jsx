import Link from "next/link";

import GitHubButton from "../components/GitHubButton";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-5xl px-6 py-24">
        <h1 className="text-5xl font-bold">
          RepoAssistant
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-600">
          AI Software Engineer Agent that
          helps you understand and work with
          your GitHub repositories.
        </p>

        <div className="mt-8 flex gap-4">
          <GitHubButton />

          <Link
            href="/dashboard"
            className="rounded-lg border px-5 py-3"
          >
            Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}