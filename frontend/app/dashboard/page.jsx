import BackendStatus from "../../components/BackendStatus";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <p className="text-sm font-medium text-gray-400">
            AI SOFTWARE ENGINEER
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Developer Dashboard
          </h1>

          <p className="mt-3 text-gray-400">
            Phase 1 project foundation
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-xl font-semibold">
              Backend
            </h2>

            <p className="mt-2 text-gray-400">
              Express API and PostgreSQL connection status.
            </p>

            <div className="mt-5">
              <BackendStatus />
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-xl font-semibold">
              Project Status
            </h2>

            <div className="mt-5 space-y-3 text-gray-300">
              <div>✓ Next.js frontend</div>
              <div>✓ Express backend</div>
              <div>✓ PostgreSQL</div>
              <div>○ GitHub integration — Phase 2</div>
              <div>○ AI Agent — Phase 5</div>
              <div>○ Docker Sandbox — Phase 4</div>
              <div>○ SSE — Phase 6</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}