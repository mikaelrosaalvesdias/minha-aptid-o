import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { ArrowLeft, MapPin, Briefcase, Banknote, Calendar, Building2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { AddJobToQueueButton } from "@/components/AddJobToQueueButton";

export const dynamic = "force-dynamic";

function compatColor(score: number): string {
  if (score >= 75) return "var(--success)";
  if (score >= 50) return "var(--primary)";
  if (score >= 30) return "var(--warning)";
  return "var(--danger)";
}

export default async function VagaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const job = await prisma.job.findFirst({ where: { id, userId: user.id } });
  if (!job) {
    return (
      <main className="ambient-shell">
        <div className="ambient-content page-shell" style={{ minHeight: "calc(100vh - 72px)", display: "grid", placeItems: "center" }}>
          <div className="proto-card empty-state" style={{ padding: 48 }}><p>Vaga não encontrada.</p><Link href="/vagas" className="proto-btn">Voltar</Link></div>
        </div>
      </main>
    );
  }

  if (!job.viewed) await prisma.job.update({ where: { id }, data: { viewed: true } });

  const application = await prisma.jobApplication.findUnique({ where: { userId_jobId: { userId: user.id, jobId: id } } });

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
    <main className="ambient-shell">
      <div className="ambient-content proto-shell-sm">
        <Link href="/vagas" className="proto-btn ghost" style={{ alignSelf: "flex-start", width: "max-content", marginBottom: 18 }}><ArrowLeft size={18} /> Voltar para vagas</Link>
        <div className="proto-card" style={{ padding: "clamp(24px,4vw,38px)", display: "grid", gap: 22 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "space-between", alignItems: "flex-start" }}>
            <div><span style={{ fontSize: ".74rem", letterSpacing: ".06em", textTransform: "uppercase", color: "var(--primary)", fontWeight: 700 }}>{sourceLabels[job.source] ?? job.source}</span><h1 className="proto-title" style={{ fontSize: "clamp(1.7rem,3.4vw,2.4rem)", marginTop: 6 }}>{job.title}</h1><p style={{ margin: "6px 0 0", color: "var(--muted)", fontWeight: 600 }}>{job.company}</p></div>
            <div style={{ textAlign: "center", background: "var(--success-soft)", border: "1px solid color-mix(in srgb,var(--success) 25%,transparent)", borderRadius: 16, padding: "16px 22px" }}><div style={{ fontFamily: "var(--font-head)", fontSize: "2.2rem", fontWeight: 600, color: "var(--success)", lineHeight: 1 }}>{job.compatibilityScore}%</div><span style={{ fontSize: ".78rem", color: "var(--muted)", fontWeight: 600 }}>compatível</span></div>
          </div>

          <div className="job-meta">
            {(job.city || job.state) && <span><MapPin size={13} style={{ display: "inline", marginRight: 6 }} />{[job.city, job.state].filter(Boolean).join(", ")}</span>}
            {job.modelo && <span><Briefcase size={13} style={{ display: "inline", marginRight: 6 }} />{job.modelo}</span>}
            {job.salario && <span><Banknote size={13} style={{ display: "inline", marginRight: 6 }} />{job.salario}</span>}
            {job.publishedAt && <span><Calendar size={13} style={{ display: "inline", marginRight: 6 }} />Publicada em {new Date(job.publishedAt).toLocaleDateString("pt-BR")}</span>}
          </div>

          <div className="compat-row" style={{ marginTop: 4 }}>
            <span className="compat-score" style={{ color, fontSize: "2rem" }}>{job.compatibilityScore}%</span>
            <div className="compat-bar"><div className="compat-fill" style={{ width: `${job.compatibilityScore}%`, background: color }} /></div>
          </div>
          {job.compatibilityReason && <p className="compat-reason">{job.compatibilityReason}</p>}
          {job.compatibilityBlock && <p className="compat-block">⚠ {job.compatibilityBlock}</p>}

          <div className="proto-card primary-soft" style={{ display: "flex", gap: 13, alignItems: "flex-start", padding: "16px 18px" }}><ShieldAlert size={19} style={{ flexShrink: 0, marginTop: 1, color: "var(--primary)" }} /><p style={{ margin: 0, color: "var(--muted)", fontSize: ".92rem", lineHeight: 1.6 }}><strong style={{ color: "var(--text)" }}>Por que combina:</strong> a vaga valoriza raciocínio analítico, SQL e organização — aptidões fortes no seu perfil.</p></div>

          {job.description && <div><h3 className="proto-title" style={{ fontSize: "1.2rem", margin: "0 0 10px" }}>Descrição</h3><p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{job.description}</p></div>}

          {requisitos.length > 0 && <div><h3 className="proto-title" style={{ fontSize: "1.2rem", margin: "0 0 10px" }}>Requisitos</h3><ul style={{ margin: 0, paddingInlineStart: 18, color: "var(--muted)", lineHeight: 1.8 }}>{requisitos.map((r) => <li key={r}>{r}</li>)}</ul></div>}

          {beneficios.length > 0 && <div><h3 className="proto-title" style={{ fontSize: "1.2rem", margin: "0 0 10px" }}>Benefícios</h3><ul style={{ margin: 0, paddingInlineStart: 18, color: "var(--muted)", lineHeight: 1.8 }}>{beneficios.map((b) => <li key={b}>{b}</li>)}</ul></div>}

          <div className="proto-card" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 18 }}><ShieldAlert size={20} style={{ flexShrink: 0, marginTop: 2, color: "var(--primary)" }} /><div><strong>Compatibilidade da fonte: {supportLabels[job.sourceAutoSupport] ?? job.sourceAutoSupport}</strong><p style={{ margin: "4px 0 0", fontSize: ".9rem", color: "var(--muted)", lineHeight: 1.6 }}>A candidatura automática só é tentada em fontes seguras. Para esta fonte, abra o link e candidate-se manualmente quando necessário.</p></div></div>

          <div className="job-actions" style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
            <AddJobToQueueButton jobId={job.id} originalUrl={job.originalUrl} />
            <button className="proto-btn" style={{ height: 52 }}>Salvar para depois</button>
            {application && <span className={`status-badge status-${application.status}`}>{application.status === "publicado" && <CheckCircle2 size={14} />}{application.status.replace(/_/g, " ")}</span>}
          </div>
        </div>
      </div>
    </main>
  );
}
