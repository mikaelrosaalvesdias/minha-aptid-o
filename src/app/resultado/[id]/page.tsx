import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, GraduationCap, Search, Sparkles, Target } from "lucide-react";
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

  return (
    <main className="result-page">
      <section className="result-hero">
        <div className="page-shell result-hero-grid">
          <div>
            <Link href="/teste" className="button ghost">
              <ArrowLeft size={18} /> Refazer teste
            </Link>
            <p className="eyebrow">Resultado do perfil</p>
            <h1>{mainProfile?.name ?? "Perfil em construção"}</h1>
            <p className="result-summary">{buildHumanSummary(topProfiles)}</p>
            {result.session.name && <p className="muted">Resultado de {result.session.name}</p>}
          </div>
          <div className="result-score-card card">
            <span>Compatibilidade principal</span>
            <strong>{mainProfile?.percentage ?? 0}%</strong>
            <p>Use este número como sinal de afinidade, não como decisão final.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-shell result-grid">
          <div className="result-main">
            <section className="result-block card">
              <div className="block-title">
                <Target size={22} />
                <h2>Top 3 perfis</h2>
              </div>
              <ProfileBarChart profiles={topProfiles} />
              <div className="profile-list">
                {topProfiles.map((profile, index) => (
                  <ProfileResultCard key={profile.slug} profile={profile} rank={index + 1} />
                ))}
              </div>
            </section>

            <section className="result-block card">
              <div className="block-title">
                <Sparkles size={22} />
                <h2>Forças e pontos a desenvolver</h2>
              </div>
              <div className="two-columns">
                <div>
                  <h3>Forças detectadas</h3>
                  <div className="chip-list">
                    {strengths.map((item) => (
                      <span className="pill" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3>Pontos de atenção</h3>
                  <ul className="clean-list">
                    {attentionPoints.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className="result-block card">
              <div className="block-title">
                <GraduationCap size={22} />
                <h2>Cursos e faculdades que combinam</h2>
              </div>
              <div className="two-columns">
                <div>
                  <h3>Faculdade ou graduação tecnológica</h3>
                  <ul className="clean-list">
                    {degreeSuggestions.map((degree) => (
                      <li key={degree}>{degree}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Cursos rápidos para testar</h3>
                  <div className="chip-list">
                    {shortCourses.map((course) => (
                      <span className="pill" key={course}>
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="course-grid">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </section>

            <section className="result-block card">
              <div className="block-title">
                <Search size={22} />
                <h2>Busca de cursos e vídeos gratuitos</h2>
              </div>
              <p className="muted">
                Quando não houver chave de API configurada, o app gera buscas prontas em fontes públicas e seguras.
              </p>
              <div className="search-links">
                {searchLinks.map((link) => (
                  <a href={link.url} target="_blank" rel="noreferrer" className="button secondary" key={`${link.label}-${link.url}`}>
                    {link.label}
                  </a>
                ))}
              </div>
              <VideoRecommendations keywords={keywords} />
            </section>

            <section className="result-block card">
              <div className="block-title">
                <CalendarDays size={22} />
                <h2>Plano de ação</h2>
              </div>
              <div className="two-columns">
                <div>
                  <h3>7 dias</h3>
                  <ol className="action-list">
                    {actionPlan7Days().map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3>30 dias</h3>
                  <ol className="action-list">
                    {actionPlan30Days().map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>
          </div>

          <aside className="result-side">
            <div className="side-card card" style={{ borderColor: "rgba(139, 92, 246, 0.4)", boxShadow: "0 0 20px rgba(139, 92, 246, 0.15)" }}>
              <h2><Sparkles size={20} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }}/>Mentor IA</h2>
              <p>Converse com um mentor virtual que já conhece seu perfil e tire dúvidas sobre carreira.</p>
              <Link href={`/mentor/${result.id}`} className="button" style={{ width: "100%" }}>
                Conversar agora
              </Link>
            </div>
            <div className="side-card card">
              <h2>Testes práticos recomendados</h2>
              <p>Faça testes curtos para validar capacidades antes de escolher um curso longo.</p>
              <CapacityTestsClient resultId={result.id} recommendedProfileSlugs={profileSlugs} existingScores={asCapacityScores(result.capacityScores)} />
            </div>
            <div className="side-card card">
              <h2>Baixar Resultado</h2>
              <p>Guarde este mapa para consultar seus pontos fortes e caminhos recomendados no futuro.</p>
              <DownloadPDFButton />
            </div>
            <div className="side-card card">
              <h2>Controle dos dados</h2>
              <p>Você pode apagar esta sessão e remover respostas e resultado do banco.</p>
              <DeleteResultButton resultId={result.id} />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
