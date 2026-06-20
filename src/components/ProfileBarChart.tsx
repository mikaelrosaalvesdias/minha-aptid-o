import type { TopProfileResult } from "@/lib/types";

export function ProfileBarChart({ profiles }: { profiles: TopProfileResult[] }) {
  return (
    <div className="bar-chart" aria-label="Gráfico de compatibilidade">
      {profiles.map((profile) => (
        <div className="bar-row" key={profile.slug}>
          <div className="bar-label">
            <span>{profile.name}</span>
            <strong>{profile.percentage}%</strong>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${profile.percentage}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
