"use client";

import { useEffect, useState } from "react";
import { Loader2, History, Search } from "lucide-react";

type SearchRow = {
  id: string;
  searchedAt: string;
  source: string;
  query?: string | null;
  foundCount: number;
  newCount: number;
};

export function JobHistoryClient() {
  const [searches, setSearches] = useState<SearchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jobs/history")
      .then((r) => r.json())
      .then((d) => setSearches(d.searches ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="inline-loading" style={{ padding: 40 }}><Loader2 className="spin" size={20} /> Carregando histórico...</div>;
  }

  if (searches.length === 0) {
    return (
      <div className="card empty-state">
        <History size={40} />
        <p>Nenhuma busca realizada ainda.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {searches.map((s) => (
        <div key={s.id} className="history-row">
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <Search size={18} style={{ color: "var(--accent-primary)" }} />
            <div>
              <strong>{s.query || "Busca de vagas"}</strong>
              <p className="muted" style={{ margin: "2px 0 0", fontSize: "0.85rem" }}>
                {new Date(s.searchedAt).toLocaleString("pt-BR")} · Fontes: {s.source}
              </p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <strong style={{ color: "var(--accent-primary)" }}>{s.newCount}</strong>
            <span className="muted" style={{ fontSize: "0.85rem" }}> novas de {s.foundCount} encontradas</span>
          </div>
        </div>
      ))}
    </div>
  );
}
