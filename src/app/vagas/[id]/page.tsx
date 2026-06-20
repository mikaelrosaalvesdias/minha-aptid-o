import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { ExternalLink, ArrowLeft, MapPin, Briefcase, Banknote, Calendar, Building2, ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function compatColor(score: number): string {
  if (score >= 75) return "#10b981";
  if (score >= 50) return "#8b5cf6";
  if (score >= 30) return "#f59e0b";
  return "#ef4444";
}

export default async function VagaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const job = await prisma.job.findFirst({ where: { id, userId: user.id } });
  if (!job) {
    return (
      <main className="page-shell vagas-shell">
        <div className="card empty-state"><p>Vaga não encontrada.</p><Link href="/vagas" className="button">Voltar</Link></div>
      </main>
    );
  }

  if (!job.viewed) {
    await prisma.job.update({ where: { id }, data: { viewed: true } });
  }

  const application = await prisma.jobApplication.findUnique({
    where: { userId_jobId: { userId: user.id, jobId: id } }
  });

  const color = compatColor(job.compatibilityScore);
  const requisitos = Array.isArray(job.requisitos) ? (job.requisitos as string[]) : [];
  const beneficios = Array.isArray(job.beneficios) ? (job.beneficios as string[]) : [];

  const sourceLabels: Record<string, string> = {
    remotive: "Remotive", linkedin: "LinkedIn", indeed: "Indeed", vagas: "Vagas.com",
    catho: "Catho", infojobs: "InfoJobs", google_jobs: "Google Vagas", curado: "Busca curada"
  };
  const supportLabels: Record<string, string> = {
    auto: "Suporta publicação automática",
    link_only: "Suporta apenas abertura do link",
    needs_login: "Precisa de login",
    has_captcha: "Possui captcha",
    blocks_automation: "Bloqueia automação",
    untested: "Não testado"
  };

  return (
    <main className="page-shell vagas-shell">
      <Link href="/vagas" className="button ghost" style={{ alignSelf: "flex-start" }}>
        <ArrowLeft size={18} /> Voltar para vagas
      </Link>

      <div className="card" style={{ padding: 32, display: "grid", gap: 20 }}>
        <div>
          <span className="job-source">{sourceLabels[job.source] ?? job.source}</span>
          <h1 style={{ margin: "8px 0 4px", fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>{job.title}</h1>
          {job.company && <p style={{ margin: 0, color: "#c4b5fd", fontWeight: 600 }}><Building2 size={18} style={{ display: "inline", marginRight: 8 }} />{job.company}</p>}
        </div>

        <div className="job-meta">
          {(job.city || job.state) && <span><MapPin size={13} style={{ display: "inline", marginRight: 6 }} />{[job.city, job.state].filter(Boolean).join(", ")}</span>}
          {job.modelo && <span><Briefcase size={13} style={{ display: "inline", marginRight: 6 }} />{job.modelo}</span>}
          {job.salario && <span><Banknote size={13} style={{ display: "inline", marginRight: 6 }} />{job.salario}</span>}
          {job.publishedAt && <span><Calendar size={13} style={{ display: "inline", marginRight: 6 }} />Publicada em {new Date(job.publishedAt).toLocaleDateString("pt-BR")}</span>}
        </div>

        <div className="compat-row" style={{ marginTop: 4 }}>
          <span className="compat-score" style={{ color, fontSize: "2rem" }}>{job.compatibilityScore}</span>
          <div className="compat-bar"><div className="compat-fill" style={{ width: `${job.compatibilityScore}%`, background: color }} /></div>
        </div>
        {job.compatibilityReason && <p className="compat-reason">{job.compatibilityReason}</p>}
        {job.compatibilityBlock && <p className="compat-block">⚠ {job.compatibilityBlock}</p>}

        {job.description && (
          <div>
            <h3 style={{ margin: "0 0 12px" }}>Descrição</h3>
            <p className="muted" style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{job.description}</p>
          </div>
        )}

        {requisitos.length > 0 && (
          <div>
            <h3 style={{ margin: "0 0 12px" }}>Requisitos</h3>
            <div className="chip-list">{requisitos.map((r) => <span key={r} className="pill">{r}</span>)}</div>
          </div>
        )}

        {beneficios.length > 0 && (
          <div>
            <h3 style={{ margin: "0 0 12px" }}>Benefícios</h3>
            <ul className="clean-list">{beneficios.map((b) => <li key={b}>{b}</li>)}</ul>
          </div>
        )}

        <div className="warning-box" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Compatibilidade da fonte: {supportLabels[job.sourceAutoSupport] ?? job.sourceAutoSupport}</strong>
            <p style={{ margin: "4px 0 0", fontSize: "0.9rem" }}>
              A candidatura automática só é tentada em fontes seguras. Para esta fonte, abra o link e candidate-se manualmente quando necessário.
            </p>
          </div>
        </div>

        <div className="job-actions" style={{ marginTop: 8 }}>
          <a href={job.originalUrl} target="_blank" rel="noreferrer" className="button">
            <ExternalLink size={18} /> Abrir vaga no site
          </a>
          {application && (
            <span className={`status-badge status-${application.status}`}>
              {application.status === "publicado" && <CheckCircle2 size={14} />}
              {application.status.replace(/_/g, " ")}
            </span>
          )}
        </div>
      </div>
    </main>
  );
}
