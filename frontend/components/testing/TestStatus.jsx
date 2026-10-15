export default function TestStatus({ title, status, details }) {
  const styles = {
    passed: "border-green-800 bg-green-950/30 text-green-300",
    failed: "border-red-800 bg-red-950/30 text-red-300",
    running: "border-blue-800 bg-blue-950/30 text-blue-300",
    pending: "border-slate-700 bg-slate-900 text-slate-300",
  };

  const currentStatus = styles[status] ? status : "pending";

  return (
    <div
      className={`rounded-xl border p-4 ${styles[currentStatus]}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-xs font-bold uppercase">
          {currentStatus}
        </span>
      </div>

      {details && (
        <p className="mt-2 text-sm opacity-80">{details}</p>
      )}
    </div>
  );
}
