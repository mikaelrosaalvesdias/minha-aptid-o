import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCircle2, GraduationCap, Search, Sparkles, Target, TrendingUp, Users, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { actionPlan30Days, actionPlan7Days, providerSearchLinks, uniqueKeywords } from "@/lib/recommendations";
import { buildHumanSummary } from "@/lib/scoring";
import type { CapacityScore, TopProfileResult } from "@/lib/types";
import { ProfileBarChart } from "@/components/ProfileBarChart";
import { ProfileResultCard } from "@/components/ProfileResultCard";
import { CourseCard } from "@/components/CourseCard";
import { VideoRecommendations } from "@/components/VideoRecommendations";
import { CapacityTestsClient } from "@/components/CapacityTestsClient";
import { DeleteResultButton } from "@/components/ResultActions";
import { DownloadPDFButton } from "@/components/DownloadPDFButton";

export const dynamic = "force-dynamic";

function asTopProfiles(value: unknown): TopProfileResult[] {
  return Array.isArray(value) ? (value as TopProfileResult[]) : [];
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function asCapacityScores(value: unknown): CapacityScore[] {
  return Array.isArray(value) ? (value as CapacityScore[]) : [];
}

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await prisma.result.findUnique({
    where: { id },
    include: { session: true }
  });

  if (!result) notFound();

  const topProfiles = asTopProfiles(result.topProfiles);
  const mainProfile = topProfiles[0];
  const scores = result.scores as {
    detectedStrengths?: string[];
    detectedAttentionPoints?: string[];
  };
  const detectedStrengths = asStringArray(scores.detectedStrengths);
  const detectedAttentionPoints = asStringArray(scores.detectedAttentionPoints);
  const keywords = uniqueKeywords(topProfiles, 8);
  const searchLinks = keywords.flatMap((keyword) => providerSearchLinks(keyword)).slice(0, 10);
  const profileSlugs = topProfiles.map((profile) => profile.slug);

  const courses = await prisma.courseRecommendation.findMany({
    where: {
      active: true,
      profileSlug: { in: profileSlugs }
    },
    orderBy: [{ profileSlug: "asc" }, { order: "asc" }],
    take: 10
  });

  const degreeSuggestions = Array.from(new Set(topProfiles.flatMap((profile) => profile.suggestedDegrees))).slice(0, 10);
  const shortCourses = Array.from(new Set(topProfiles.flatMap((profile) => profile.suggestedShortCourses))).slice(0, 12);
  const attentionPoints = Array.from(new Set([...detectedAttentionPoints, ...(mainProfile?.attentionPoints ?? [])])).slice(0, 8);
  const strengths = Array.from(new Set([...detectedStrengths, ...(mainProfile?.strengths ?? [])])).slice(0, 10);
  const topPercent = mainProfile?.percentage ?? 0;

  return (
    <main className="ambient-shell">
      <div className="ambient-content">
        <section className="proto-shell-md" style={{ paddingBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32, alignItems: "end" }}>
            <div>
              <Link href="/teste" className="proto-btn ghost" style={{ width: "max-content", marginBottom: 14 }}><ArrowLeft size={18} /> Refazer teste</Link>
              <p className="proto-eyebrow">Seu resultado está pronto</p>
              <h1 className="proto-title" style={{ fontSize: "clamp(2.3rem,4.6vw,3.6rem)", marginTop: 14 }}>Você tem um perfil <em style={{ fontStyle: "italic", color: "var(--primary)" }}>{(mainProfile?.description || buildHumanSummary(topProfiles)).slice(0, 64)}</em>.</h1>
              <p className="proto-subtitle" style={{ fontSize: "1.12rem", maxWidth: 620 }}>{buildHumanSummary(topProfiles)}</p>
              {result.session.name && <p className="muted" style={{ marginTop: 12 }}>Resultado de {result.session.name}</p>}
            </div>
            <div style={{ background: "linear-gradient(150deg,var(--primary),#5a93f7)", borderRadius: 24, boxShadow: "var(--shadow-lg)", padding: 30, textAlign: "center", color: "#fff" }}>
              <span style={{ fontSize: ".82rem", letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 600, opacity: .9 }}>Compatibilidade do topo</span>
              <div style={{ fontFamily: "var(--font-head)", fontSize: "4.4rem", fontWeight: 600, lineHeight: 1, margin: "10px 0" }}>{topPercent}<span style={{ fontSize: "1.6rem" }}>%</span></div>
              <span style={{ opacity: .92, fontSize: ".95rem" }}>{mainProfile?.name ?? "Perfil"}</span>
            </div>
          </div>
        </section>

        <section className="proto-shell-md" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, alignItems: "start", paddingTop: 16 }}>
          <div style={{ display: "grid", gap: 22 }}>
            <section className="proto-card" style={{ padding: "clamp(24px,4vw,32px)", display: "grid", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}><Target size={22} color="var(--primary)" /><h2 className="proto-title" style={{ fontSize: "1.4rem", margin: 0 }}>Carreiras compatíveis</h2></div>
              <div style={{ display: "grid", gap: 13 }}>
                {topProfiles.slice(0, 3).map((profile, index) => (
                  <div key={profile.slug} style={{ display: "grid", gridTemplateColumns: "46px 1fr auto", gap: 18, alignItems: "center", padding: 18, borderRadius: 16, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                    <span style={{ display: "inline-flex", width: 46, height: 46, alignItems: "center", justifyContent: "center", borderRadius: 13, background: index === 0 ? "var(--primary)" : "var(--primary-soft)", color: index === 0 ? "#fff" : "var(--primary)", fontWeight: 700, fontFamily: "var(--font-head)", fontSize: "1.2rem" }}>{index + 1}</span>
                    <div><h3 style={{ margin: 0, fontSize: "1.12rem", fontWeight: 600 }}>{profile.name}</h3><p style={{ margin: "5px 0 0", color: "var(--muted)", fontSize: ".92rem", lineHeight: 1.5 }}>{profile.description || "Combina com suas respostas e aptidões detectadas."}</p></div>
                    <span style={{ fontFamily: "var(--font-head)", fontSize: "1.7rem", fontWeight: 600, color: "var(--primary)" }}>{profile.percentage}%</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="proto-card" style={{ padding: "clamp(24px,4vw,32px)", display: "grid", gap: 18 }}>
              <div className="block-title"><Sparkles size={22} color="var(--primary)" /><h2 className="proto-title" style={{ fontSize: "1.4rem", margin: 0 }}>Suas aptidões</h2></div>
              <div style={{ display: "grid", gap: 15 }}>
                {strengths.slice(0, 4).map((item, index) => (
                  <div key={item} style={{ display: "grid", gap: 7 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".92rem", fontWeight: 600 }}><span>{item}</span><span style={{ color: "var(--primary)" }}>{[92, 85, 80, 70][index] ?? 70}%</span></div>
                    <div style={{ height: 11, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}><div style={{ height: "100%", width: `${[92, 85, 80, 70][index] ?? 70}%`, borderRadius: 999, background: "linear-gradient(90deg,var(--primary),#5a93f7)" }} /></div>
                  </div>
                ))}
              </div>
            </section>

            <section className="proto-card" style={{ padding: "clamp(24px,4vw,32px)", display: "grid", gap: 18 }}>
              <h2 className="proto-title" style={{ fontSize: "1.4rem", margin: 0 }}>Cursos recomendados</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                {courses.slice(0, 3).map((course) => (
                  <div key={course.id} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, display: "grid", gap: 9 }}>
                    <span style={{ fontSize: ".74rem", letterSpacing: ".08em", textTransform: "uppercase", color: course.isFree ? "var(--success)" : "var(--warning)", fontWeight: 700 }}>{course.isFree ? "Curso gratuito" : "Pago"}</span>
                    <strong style={{ fontSize: "1rem", lineHeight: 1.4 }}>{course.title}</strong>
                    <Link href={course.url} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontWeight: 600, fontSize: ".88rem", display: "inline-flex", alignItems: "center", gap: 6 }}>Acessar <ArrowLeft size={14} style={{ transform: "rotate(180deg)" }} /></Link>
                  </div>
                ))}
                {courses.length === 0 && <p className="muted">Nenhum curso encontrado ainda. Volte depois para novas recomendações.</p>}
              </div>
            </section>
          </div>

          <aside style={{ position: "sticky", top: 95, display: "grid", gap: 16 }}>
            <div className="proto-card" style={{ padding: 26, display: "grid", gap: 13 }}>
              <h3 className="proto-title" style={{ fontSize: "1.2rem", margin: 0 }}>Próximos passos</h3>
              <Link href={`/mentor/${result.id}`} className="proto-btn primary" style={{ width: "100%" }}><Sparkles size={18} /> Falar com mentor IA</Link>
              <Link href={`/curriculo/${result.id}`} className="proto-btn" style={{ width: "100%" }}>Montar meu currículo</Link>
              <Link href="/vagas" className="proto-btn" style={{ width: "100%" }}>Ver vagas compatíveis</Link>
            </div>
            <div className="proto-card success-soft" style={{ padding: 22, display: "grid", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, color: "var(--success)", fontWeight: 700 }}><CheckCircle2 size={19} />Lembre-se</div>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: ".9rem", lineHeight: 1.6 }}>Este resultado é um apoio ao autoconhecimento, não um diagnóstico. Você pode refazer o teste quando quiser.</p>
            </div>
          </aside>
        </section>

        <section className="proto-shell-md" style={{ display: "grid", gap: 24 }}>
          <div className="proto-card" style={{ padding: "clamp(24px,4vw,32px)", display: "grid", gap: 18 }}>
            <div className="block-title"><TrendingUp size={22} color="var(--primary)" /><h2 className="proto-title" style={{ fontSize: "1.4rem", margin: 0 }}>Mapa detalhado</h2></div>
            <ProfileBarChart profiles={topProfiles} />
            <div className="profile-list">
              {topProfiles.map((profile, index) => <ProfileResultCard key={profile.slug} profile={profile} rank={index + 1} />)}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
            <div className="proto-card" style={{ padding: 26, display: "grid", gap: 13 }}><h3 className="proto-title" style={{ fontSize: "1.15rem", margin: 0, display: "flex", alignItems: "center", gap: 9 }}><CheckCircle2 size={19} color="var(--success)" />Forças</h3><ul style={{ margin: 0, paddingInlineStart: 18, color: "var(--muted)", lineHeight: 1.8 }}>{strengths.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div className="proto-card" style={{ padding: 26, display: "grid", gap: 13 }}><h3 className="proto-title" style={{ fontSize: "1.15rem", margin: 0, display: "flex", alignItems: "center", gap: 9 }}><AlertTriangle size={19} color="var(--warning)" />Pontos de atenção</h3><ul style={{ margin: 0, paddingInlineStart: 18, color: "var(--muted)", lineHeight: 1.8 }}>{attentionPoints.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </div>

          <div className="proto-card" style={{ padding: "clamp(24px,4vw,32px)", display: "grid", gap: 18 }}>
            <div className="block-title"><GraduationCap size={22} color="var(--primary)" /><h2 className="proto-title" style={{ fontSize: "1.4rem", margin: 0 }}>Cursos e faculdades que combinam</h2></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
              <div><h3 style={{ margin: 0, fontFamily: "var(--font-head)", fontSize: "1.15rem" }}>Faculdade ou graduação tecnológica</h3><ul style={{ color: "var(--muted)", lineHeight: 1.8 }}>{degreeSuggestions.map((degree) => <li key={degree}>{degree}</li>)}</ul></div>
              <div><h3 style={{ margin: 0, fontFamily: "var(--font-head)", fontSize: "1.15rem" }}>Cursos rápidos para testar</h3><ul style={{ color: "var(--muted)", lineHeight: 1.8 }}>{shortCourses.map((course) => <li key={course}>{course}</li>)}</ul></div>
            </div>
            <div className="course-grid">{courses.map((course) => <CourseCard key={course.id} course={course} />)}</div>
          </div>

          <div className="proto-card" style={{ padding: "clamp(24px,4vw,32px)", display: "grid", gap: 18 }}>
            <div className="block-title"><Search size={22} color="var(--primary)" /><h2 className="proto-title" style={{ fontSize: "1.4rem", margin: 0 }}>Busca de cursos e vídeos gratuitos</h2></div>
            <p className="muted">Quando não houver chave de API configurada, o app gera buscas prontas em fontes públicas e seguras.</p>
            <div className="job-actions">{searchLinks.map((link) => <a href={link.url} target="_blank" rel="noreferrer" className="button secondary" key={`${link.label}-${link.url}`}>{link.label}</a>)}</div>
            <VideoRecommendations keywords={keywords} />
          </div>

          <div className="proto-card" style={{ padding: "clamp(24px,4vw,32px)", display: "grid", gap: 18 }}>
            <div className="block-title"><CalendarDays size={22} color="var(--primary)" /><h2 className="proto-title" style={{ fontSize: "1.4rem", margin: 0 }}>Plano de ação</h2></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
              <div><h3 style={{ margin: 0, fontFamily: "var(--font-head)", fontSize: "1.15rem" }}>7 dias</h3><ol style={{ color: "var(--muted)", lineHeight: 1.8 }}>{actionPlan7Days().map((item) => <li key={item}>{item}</li>)}</ol></div>
              <div><h3 style={{ margin: 0, fontFamily: "var(--font-head)", fontSize: "1.15rem" }}>30 dias</h3><ol style={{ color: "var(--muted)", lineHeight: 1.8 }}>{actionPlan30Days().map((item) => <li key={item}>{item}</li>)}</ol></div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            <Link href={`/mentor/${result.id}`} className="proto-card" style={{ padding: 24, display: "grid", gap: 9 }}><Sparkles size={24} color="var(--primary)" /><strong>Conversar com mentor IA</strong><span className="muted" style={{ fontSize: ".92rem", lineHeight: 1.5 }}>Orientação baseada no seu perfil</span></Link>
            <Link href={`/curriculo/${result.id}`} className="proto-card" style={{ padding: 24, display: "grid", gap: 9 }}><Target size={24} color="var(--primary)" /><strong>Editar currículo</strong><span className="muted" style={{ fontSize: ".92rem", lineHeight: 1.5 }}>Templates, pontuação e exportação</span></Link>
            <Link href="/vagas" className="proto-card" style={{ padding: 24, display: "grid", gap: 9 }}><Users size={24} color="var(--primary)" /><strong>Ver vagas</strong><span className="muted" style={{ fontSize: ".92rem", lineHeight: 1.5 }}>Busca alinhada ao seu perfil</span></Link>
            <DownloadPDFButton />
          </div>

          <div className="proto-card" style={{ padding: "24px 28px", display: "grid", gap: 12 }}>
            <h3 className="proto-title" style={{ fontSize: "1.2rem", margin: 0 }}>Controle dos dados</h3>
            <p className="muted">Você pode apagar esta sessão e remover respostas e resultado do banco.</p>
            <DeleteResultButton resultId={result.id} />
          </div>
        </section>
      </div>
    </main>
  );
}
