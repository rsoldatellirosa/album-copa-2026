export default function ProgressBar({
  value,
  total,
  className = "",
}: {
  value: number;
  total: number;
  className?: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className={className}>
      <div className="h-2 w-full rounded bg-black/5 overflow-hidden">
        <div
          className="h-full rounded bg-mint-deep transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
