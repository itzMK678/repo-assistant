export default function DiffViewer({ files = [] }) {
  if (!files || files.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="font-semibold text-white">Proposed Changes</h2>
        <p className="mt-3 text-sm text-slate-400">
          No diff is available yet. Run an agent task to prepare changes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {files.map((file) => (
        <section
          key={file.path}
          className="overflow-hidden rounded-xl border border-slate-800"
        >
          <div className="flex items-center justify-between bg-slate-900 px-4 py-3 font-mono text-sm text-white">
            <span>{file.path}</span>
            {file.status && (
              <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                {file.status}
              </span>
            )}
          </div>

          <pre className="overflow-x-auto bg-slate-950 p-4 font-mono text-sm">
            {(file.lines || []).map((line, index) => (
              <div
                key={`${file.path}-${index}`}
                className={`flex px-2 py-0.5 ${
                  line.type === "added"
                    ? "bg-green-950/60 text-green-300"
                    : line.type === "removed"
                    ? "bg-red-950/60 text-red-300"
                    : "text-slate-400"
                }`}
              >
                <span className="mr-3 select-none font-bold">
                  {line.type === "added"
                    ? "+"
                    : line.type === "removed"
                    ? "-"
                    : " "}
                </span>
                <span className="whitespace-pre">{line.text}</span>
              </div>
            ))}
          </pre>
        </section>
      ))}
    </div>
  );
}
