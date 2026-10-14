const stages = [
  "Diff generated",
  "Changes approved",
  "Branch created",
  "Changes committed",
  "Changes pushed",
  "Pull request created",
];

export default function GitWorkflowStatus({ completed = [] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-white">
      <h2 className="text-xl font-semibold">Workflow Status</h2>

      <div className="mt-5 space-y-4">
        {stages.map((stage, index) => {
          const done = completed.includes(stage);

          return (
            <div key={stage} className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  done
                    ? "bg-green-900 text-green-300 border border-green-700"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {done ? "✓" : index + 1}
              </span>

              <span className={done ? "text-green-300 font-medium" : "text-slate-400"}>
                {stage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
