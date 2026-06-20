export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const normalized = Math.max(0, Math.min(100, value));

  return (
    <div className="progress-wrap" aria-label={label ?? "Progresso"}>
      <div className="progress-meta">
        <span>{label ?? "Progresso"}</span>
        <strong>{normalized}%</strong>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${normalized}%` }} />
      </div>
    </div>
  );
}
