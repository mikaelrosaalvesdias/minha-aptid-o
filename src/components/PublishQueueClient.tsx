"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCw, ExternalLink, CheckCircle2, AlertTriangle, XCircle, Clock, Copy, Mail, Check } from "lucide-react";

type Application = {
  id: string;
  status: string;
  attemptedAt?: string | null;
  completedAt?: string | null;
  errorMessage?: string | null;
  sourceCompat?: string | null;
  job: {
    id: string;
    title: string;
    company?: string | null;
    originalUrl: string;
    source: string;
    company_name?: string;
    applyEmail?: string | null;
  };
  consent: { id: string; consentedAt: string; jobCount: number } | null;
};

type Progress = {
  total: number;
  publicados: number;
  falharam: number;
  acaoManual: number;
  aguardando: number;
  emAndamento: number;
};

type StatusMeta = { icon: typeof CheckCircle2; color: string; label: string; spin?: boolean };

const STATUS_META: Record<string, StatusMeta> = {
  publicado: { icon: CheckCircle2, color: "var(--success)", label: "Publicado com sucesso" },
  acao_manual: { icon: AlertTriangle, color: "var(--warning)", label: "Precisa de ação manual" },
  bloqueado_login: { icon: AlertTriangle, color: "var(--warning)", label: "Bloqueado por login" },
  bloqueado_captcha: { icon: AlertTriangle, color: "var(--warning)", label: "Bloqueado por captcha" },
  bloqueado_politica: { icon: AlertTriangle, color: "var(--warning)", label: "Bloqueado por política" },
  falhou: { icon: XCircle, color: "var(--danger)", label: "Falhou" },
  site_indisponivel: { icon: XCircle, color: "var(--danger)", label: "Site indisponível" },
  vaga_expirada: { icon: XCircle, color: "var(--danger)", label: "Vaga expirada" },
  formulario_nao_reconhecido: { icon: XCircle, color: "var(--danger)", label: "Formulário não reconhecido" },
  aguardando: { icon: Clock, color: "var(--primary)", label: "Aguardando" },
  em_andamento: { icon: Loader2, color: "var(--primary)", label: "Em andamento", spin: true }
};

export function PublishQueueClient() {
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [resumeText, setResumeText] = useState<string>("");
  const [mailtoUrl, setMailtoUrl] = useState<string>("");

  async function load() {
    try {
      const res = await fetch("/api/jobs/applications");
      const data = await res.json();
      setApps(data.applications ?? []);
      setProgress(data.progress ?? null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch("/api/jobs/resume-data")
      .then((r) => r.json())
      .then((d) => {
        if (d.text) setResumeText(d.text);
        if (d.mailto) setMailtoUrl(d.mailto);
      })
      .catch(() => {});
  }, []);

  async function copyResume() {
    try {
      await navigator.clipboard.writeText(resumeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Não foi possível copiar. Selecione manualmente.");
    }
  }

  const needsManual = apps.some((a) => a.status === "bloqueado_login" || a.status === "acao_manual" || a.status.startsWith("bloqueado"));

  async function retry(id: string) {
    setRetrying(id);
    try {
      await fetch(`/api/jobs/applications/${id}`, { method: "POST" });
      void load();
    } finally {
      setRetrying(null);
    }
  }

  if (loading) {
    return <div className="ambient-shell"><div className="ambient-content page-shell" style={{ minHeight: "calc(100vh - 72px)", display: "grid", placeItems: "center" }}><div className="inline-loading"><Loader2 className="spin" size={20} /> Carregando fila...</div></div></div>;
  }

  if (apps.length === 0) {
    return <div className="ambient-shell"><div className="ambient-content page-shell" style={{ minHeight: "calc(100vh - 72px)", display: "grid", placeItems: "center" }}><div className="proto-card empty-state" style={{ padding: 48 }}><CheckCircle2 size={40} color="var(--primary)" /><p>Nenhuma candidatura realizada ainda.</p><a href="/vagas" className="proto-btn primary">Selecionar vagas e publicar</a></div></div></div>;
  }

  const pct = progress ? Math.round(((progress.publicados + progress.falharam + progress.acaoManual) / progress.total) * 100) : 0;

  return (
    <div className="ambient-shell">
      <div className="ambient-content" style={{ display: "grid", gap: 24 }}>
        <div className="proto-card" style={{ padding: 20, display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, textAlign: "center" }}><strong style={{ display: "block", fontFamily: "var(--font-head)", fontSize: "2rem", fontWeight: 600, color: "var(--success)" }}>{progress?.publicados ?? 0}</strong><span style={{ fontSize: ".78rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600 }}>Publicadas</span></div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, textAlign: "center" }}><strong style={{ display: "block", fontFamily: "var(--font-head)", fontSize: "2rem", fontWeight: 600, color: "var(--warning)" }}>{progress?.acaoManual ?? 0}</strong><span style={{ fontSize: ".78rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600 }}>Ação manual</span></div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, textAlign: "center" }}><strong style={{ display: "block", fontFamily: "var(--font-head)", fontSize: "2rem", fontWeight: 600, color: "var(--primary)" }}>{progress?.aguardando ?? 0}</strong><span style={{ fontSize: ".78rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600 }}>Aguardando</span></div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, textAlign: "center" }}><strong style={{ display: "block", fontFamily: "var(--font-head)", fontSize: "2rem", fontWeight: 600, color: "var(--text)" }}>{progress?.total ?? 0}</strong><span style={{ fontSize: ".78rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600 }}>Total na fila</span></div>
          </div>
          <div style={{ height: 9, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: "linear-gradient(90deg,var(--primary),#5a93f7)" }} /></div>
        </div>

        {needsManual && resumeText && (
          <div className="proto-card warning-soft" style={{ display: "flex", gap: 13, alignItems: "flex-start", padding: "18px 20px" }}><AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 1 }} /><p style={{ margin: 0, color: "var(--muted)", fontSize: ".92rem", lineHeight: 1.6 }}>Alguns portais podem exigir login, captcha ou ação manual. Copie seu pacote de candidatura e conclua com segurança.</p></div>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          {apps.map((app) => {
            const meta = STATUS_META[app.status] ?? { icon: Clock, color: "var(--muted)", label: app.status };
            const Icon = meta.icon;
            return (
              <div key={app.id} className="history-row" style={{ background: "var(--surface)" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", flex: 1, minWidth: 200 }}>
                    <Icon size={20} style={{ color: meta.color, flexShrink: 0 }} className={meta.spin ? "spin" : ""} />
                    <div><strong style={{ fontSize: "1.02rem" }}>{app.job.title}</strong><p style={{ margin: "3px 0 0", color: "var(--muted)", fontSize: ".88rem" }}>{app.job.company ?? app.job.company_name}</p><span className={`status-badge status-${app.status}`} style={{ marginTop: 6 }}>{meta.label}</span>{app.errorMessage && <p className="muted" style={{ margin: "6px 0 0", fontSize: ".8rem" }}>{app.errorMessage}</p>}</div>
                  </div>
                  <div className="job-actions">
                    <a href={app.job.originalUrl} target="_blank" rel="noreferrer" className="proto-btn" style={{ height: 38 }}><ExternalLink size={15} /> Abrir vaga</a>
                    {app.job.applyEmail && <a href={`mailto:${app.job.applyEmail}?subject=${encodeURIComponent("Candidatura - " + app.job.title)}&body=${encodeURIComponent(resumeText)}`} className="proto-btn" style={{ height: 38 }}><Mail size={15} /> Enviar por e-mail</a>}
                    {(app.status === "bloqueado_login" || app.status === "acao_manual" || app.status.startsWith("bloqueado")) && resumeText && <button className="proto-btn" style={{ height: 38 }} onClick={copyResume}>{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copiado!" : "Copiar pacote"}</button>}
                    {(app.status === "acao_manual" || app.status === "falhou" || app.status.startsWith("bloqueado")) && <button className="proto-btn" style={{ height: 38 }} onClick={() => retry(app.id)} disabled={retrying === app.id}>{retrying === app.id ? <Loader2 className="spin" size={16} /> : <RotateCw size={16} />} Tentar novamente</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
