import { CheckCircle2 } from "lucide-react";
import type { TopProfileResult } from "@/lib/types";

export function ProfileResultCard({ profile, rank }: { profile: TopProfileResult; rank: number }) {
  return (
    <article className="profile-card card">
      <div className="profile-rank">{rank}</div>
      <div>
        <h3>{profile.name}</h3>
        <p>{profile.description}</p>
      </div>
      <div className="profile-percent">{profile.percentage}%</div>
      <div className="chip-list">
        {profile.strengths.slice(0, 5).map((strength) => (
          <span className="pill" key={strength}>
            <CheckCircle2 size={14} /> {strength}
          </span>
        ))}
      </div>
    </article>
  );
}
