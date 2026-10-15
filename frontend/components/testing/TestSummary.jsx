export default function TestSummary({ results }) {
  const passed = results.filter(
    (result) => result.status === "passed"
  ).length;

  const failed = results.filter(
    (result) => result.status === "failed"
  ).length;

  const pending = results.length - passed - failed;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-green-900 bg-green-950/30 p-5">
        <p className="text-sm text-green-300">Passed</p>
        <p className="mt-2 text-3xl font-bold text-white">{passed}</p>
      </div>

      <div className="rounded-xl border border-red-900 bg-red-950/30 p-5">
        <p className="text-sm text-red-300">Failed</p>
        <p className="mt-2 text-3xl font-bold text-white">{failed}</p>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
        <p className="text-sm text-slate-300">Pending</p>
        <p className="mt-2 text-3xl font-bold text-white">{pending}</p>
      </div>
    </div>
  );
}
