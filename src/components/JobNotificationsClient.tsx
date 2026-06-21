"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Loader2 } from "lucide-react";

type Notification = {
  id: string;
  message: string;
  areaCargo?: string | null;
  jobCount: number;
  searchDate: string;
  read: boolean;
  createdAt: string;
};

export function JobNotificationsClient() {
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs/notifications");
      const data = await res.json();
      setItems(data.notifications ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function markAll() {
    await fetch("/api/jobs/notifications", { method: "PATCH", body: JSON.stringify({ all: true }), headers: { "Content-Type": "application/json" } });
    void load();
    router.refresh();
  }

  if (loading) {
    return <div className="inline-loading" style={{ padding: 40 }}><Loader2 className="spin" size={20} /> Carregando notificações...</div>;
  }

  if (items.length === 0) {
    return <div className="proto-card empty-state" style={{ padding: 48 }}><Bell size={40} color="var(--primary)" /><p>Nenhuma notificação ainda.</p><p className="muted">Quando novas vagas compatíveis forem encontradas, você verá aqui.</p></div>;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="job-actions" style={{ justifyContent: "flex-end" }}>
        <button className="proto-btn" onClick={markAll}>Marcar todas como lidas</button>
      </div>
      {items.map((n) => (
        <div key={n.id} className={`notification-item${n.read ? "" : " unread"}`} style={{ background: n.read ? "var(--surface)" : "var(--primary-soft)", borderColor: n.read ? "var(--border)" : "color-mix(in srgb,var(--primary) 30%,transparent)" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <span className={`notification-dot${n.read ? " read" : ""}`} />
            <div>
              <p style={{ margin: 0, fontWeight: n.read ? 500 : 700 }}>{n.message}</p>
              <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>{new Date(n.createdAt).toLocaleString("pt-BR")} · {n.jobCount} vaga(s)</p>
            </div>
          </div>
          <a href="/vagas" className="proto-btn" style={{ height: 40 }}>Ver vagas</a>
        </div>
      ))}
    </div>
  );
}
