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
  publicado: { icon: CheckCircle2, color: "#6ee7b7", label: "Publicado com sucesso" },
  acao_manual: { icon: AlertTriangle, color: "#fcd34d", label: "Precisa de ação manual" },
  bloqueado_login: { icon: AlertTriangle, color: "#fcd34d", label: "Bloqueado por login" },
  bloqueado_captcha: { icon: AlertTriangle, color: "#fcd34d", label: "Bloqueado por captcha" },
  bloqueado_politica: { icon: AlertTriangle, color: "#fcd34d", label: "Bloqueado por política" },
  falhou: { icon: XCircle, color: "#fca5a5", label: "Falhou" },
  site_indisponivel: { icon: XCircle, color: "#fca5a5", label: "Site indisponível" },
  vaga_expirada: { icon: XCircle, color: "#fca5a5", label: "Vaga expirada" },
  formulario_nao_reconhecido: { icon: XCircle, color: "#fca5a5", label: "Formulário não reconhecido" },
  aguardando: { icon: Clock, color: "#93c5fd", label: "Aguardando" },
  em_andamento: { icon: Loader2, color: "#93c5fd", label: "Em andamento", spin: true }
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

  const needsManual = apps.some(
    (a) => a.status === "bloqueado_login" || a.status === "acao_manual" || a.status.startsWith("bloqueado")
  );

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
    return <div className="inline-loading" style={{ padding: 40 }}><Loader2 className="spin" size={20} /> Carregando fila...</div>;
  }

  if (apps.length === 0) {
    return (
      <div className="card empty-state">
        <CheckCircle2 size={40} />
        <p>Nenhuma candidatura realizada ainda.</p>
        <a href="/vagas" className="button">Selecionar vagas e publicar</a>
      </div>
    );
  }

  const pct = progress ? Math.round(((progress.publicados + progress.falharam + progress.acaoManual) / progress.total) * 100) : 0;

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div className="card queue-progress">
        <h2 style={{ margin: 0 }}>Progresso da fila</h2>
        <div className="progress-track" style={{ height: 12 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="queue-stats">
          <div className="queue-stat wait"><strong>{progress?.aguardando ?? 0}</strong><span>Aguardando</span></div>
          <div className="queue-stat pub"><strong>{progress?.publicados ?? 0}</strong><span>Publicados</span></div>
          <div className="queue-stat manual"><strong>{progress?.acaoManual ?? 0}</strong><span>Ação manual</span></div>
          <div className="queue-stat fail"><strong>{progress?.falharam ?? 0}</strong><span>Falhas</span></div>
          <div className="queue-stat"><strong>{progress?.total ?? 0}</strong><span>Total</span></div>
        </div>
      </div>

      {needsManual && resumeText && (
        <div className="selection-bar">
          <div>
            <strong>Vagas com login necessário</strong>
            <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>
              Copie seus dados e cole no formulário da vaga. O app não armazena senhas de outros sites.
            </p>
          </div>
          <div className="job-actions">
            <button className="button secondary" style={{ minHeight: 40 }} onClick={copyResume}>
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copiado!" : "Copiar dados do currículo"}
            </button>
            {mailtoUrl && (
              <a href={mailtoUrl} className="button ghost" style={{ minHeight: 40 }}>
                <Mail size={16} /> Enviar por e-mail
              </a>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {apps.map((app) => {
          const meta = STATUS_META[app.status] ?? { icon: Clock, color: "#a1a1aa", label: app.status };
          const Icon = meta.icon;
          const spin = meta.spin;
          return (
            <div key={app.id} className="history-row">
              <div style={{ display: "flex", gap: 14, alignItems: "center", flex: 1, minWidth: 200 }}>
                <Icon size={20} style={{ color: meta.color, flexShrink: 0 }} className={spin ? "spin" : ""} />
                <div>
                  <strong>{app.job.title}</strong>
                  {app.job.company && <p className="muted" style={{ margin: "2px 0 0", fontSize: "0.85rem" }}>{app.job.company}</p>}
                  <span className={`status-badge status-${app.status}`} style={{ marginTop: 6 }}>{meta.label}</span>
                  {app.errorMessage && <p className="muted" style={{ margin: "6px 0 0", fontSize: "0.8rem" }}>{app.errorMessage}</p>}
                </div>
              </div>
              <div className="job-actions">
                <a href={app.job.originalUrl} target="_blank" rel="noreferrer" className="button secondary" style={{ minHeight: 40, padding: "0 16px" }}>
                  <ExternalLink size={15} /> Abrir vaga
                </a>
                {app.job.applyEmail && (
                  <a
                    href={`mailto:${app.job.applyEmail}?subject=${encodeURIComponent("Candidatura - " + app.job.title)}&body=${encodeURIComponent(resumeText)}`}
                    className="button ghost"
                    style={{ minHeight: 40, padding: "0 14px" }}
                  >
                    <Mail size={15} /> Enviar por e-mail
                  </a>
                )}
                {(app.status === "bloqueado_login" || app.status === "acao_manual" || app.status.startsWith("bloqueado")) && resumeText && (
                  <button className="button ghost" style={{ minHeight: 40, padding: "0 14px" }} onClick={copyResume} title="Copiar dados do currículo para colar no formulário">
                    {copied ? <Check size={15} /> : <Copy size={15} />} Copiar dados
                  </button>
                )}
                {(app.status === "acao_manual" || app.status === "falhou" || app.status.startsWith("bloqueado")) && (
                  <button className="button ghost" style={{ minHeight: 40 }} onClick={() => retry(app.id)} disabled={retrying === app.id}>
                    {retrying === app.id ? <Loader2 className="spin" size={16} /> : <RotateCw size={16} />} Tentar novamente
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
