"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2 } from "lucide-react";

export function AddJobToQueueButton({ jobId, originalUrl }: { jobId: string; originalUrl: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function apply() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobIds: [jobId], consent: true })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao adicionar à fila.");
      setMessage("Vaga adicionada à fila de candidatura.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao adicionar à fila.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
      <button className="proto-btn primary" type="button" onClick={apply} disabled={loading} style={{ height: 52 }}>{loading ? <Loader2 className="spin" size={18} /> : <ExternalLink size={18} />} Adicionar à fila de candidatura</button>
      <a href={originalUrl} target="_blank" rel="noreferrer" className="proto-btn" style={{ height: 52 }}>Abrir vaga no site</a>
      {message && <span className="pill">{message}</span>}
    </div>
  );
}
