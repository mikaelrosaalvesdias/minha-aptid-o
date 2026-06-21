"use client";

import { useState } from "react";
import { BarChart2, Clock, ExternalLink, PlayCircle, Star, Target } from "lucide-react";

type Course = {
  id: string;
  title: string;
  provider: string;
  url: string;
  type: string;
  isFree: boolean;
  profileSlug: string;
};

type CourseClientProps = {
  initialCourses: Course[];
  profileNames: string[];
};

const sampleCourses: Course[] = [
  { id: "sample-powerbi", title: "Power BI e análise de dados", provider: "Microsoft Learn", url: "https://learn.microsoft.com/pt-br/training/powerplatform/power-bi", type: "Dados · Iniciante", isFree: true, profileSlug: "dados-analise" },
  { id: "sample-excel", title: "Excel para análise", provider: "Fundação Bradesco", url: "https://www.ev.org.br/", type: "Dados · Iniciante", isFree: true, profileSlug: "dados-analise" },
  { id: "sample-ux", title: "UX Design", provider: "Coursera", url: "https://www.coursera.org/search?query=ux%20design&language=Portuguese", type: "Design · Intermediário", isFree: false, profileSlug: "design-criatividade" },
  { id: "sample-gestao", title: "Gestão de Projetos na prática", provider: "Sebrae", url: "https://sebrae.com.br/sites/PortalSebrae/cursosonline", type: "Gestão · Iniciante", isFree: true, profileSlug: "administrativo-financeiro" }
];

const colors: Record<string, string> = {
  dados: "linear-gradient(135deg,#2563eb,#5a93f7)",
  dados2: "linear-gradient(135deg,#0ea371,#34d399)",
  design: "linear-gradient(135deg,#7c3aed,#a78bfa)",
  gestao: "linear-gradient(135deg,#c47e07,#fbbf24)"
};

function safeUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : "";
  } catch {
    return "";
  }
}

function iconFor(type: string) {
  if (type.toLowerCase().includes("sql")) return <Star size={42} color="#fff" />;
  if (type.toLowerCase().includes("design") || type.toLowerCase().includes("ux")) return <Target size={42} color="#fff" />;
  if (type.toLowerCase().includes("gest")) return <Clock size={42} color="#fff" />;
  return <BarChart2 size={42} color="#fff" />;
}

function categoryOf(course: Course) {
  const profile = course.profileSlug.toLowerCase();
  const type = course.type.toLowerCase();

  if (profile.includes("design") || type.includes("design") || type.includes("ux")) return "design";
  if (profile.includes("dados") || type.includes("sql") || type.includes("dados") || type.includes("excel") || type.includes("power") || type.includes("bi")) return "dados";
  if (profile.includes("comercial") || profile.includes("atendimento") || profile.includes("administrativo") || profile.includes("recursos") || profile.includes("operacoes") || profile.includes("educacao") || type.includes("gest")) return "gestao";
  return "dados";
}

export function CursosClient({ initialCourses, profileNames }: CourseClientProps) {
  const [filter, setFilter] = useState("todos");
  const courses = initialCourses.length ? initialCourses : sampleCourses;
  const filtered = filter === "todos" ? courses : courses.filter((course) => categoryOf(course) === filter);
  const title = profileNames[0] ? `Cursos para ${profileNames[0]}` : "Cursos para o seu perfil";

  return (
    <main className="ambient-shell">
      <div className="ambient-content proto-shell courses-shell" style={{ display: "grid", gap: 24 }}>
        <section className="courses-hero">
          <div>
            <p className="proto-eyebrow">Trilha de aprendizado</p>
            <h1 className="proto-title" style={{ fontSize: "clamp(1.9rem,3.6vw,2.7rem)" }}>{title}</h1>
            <p className="proto-subtitle" style={{ maxWidth: 560 }}>Conteúdos gratuitos e pagos, selecionados a partir das suas aptidões. Comece no seu ritmo.</p>
          </div>
          <div className="proto-card courses-progress" style={{ padding: "20px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-head)", fontSize: "2rem", fontWeight: 600, color: "var(--primary)", lineHeight: 1 }}>32%</div>
            <span style={{ fontSize: ".82rem", color: "var(--muted)", fontWeight: 600 }}>da sua trilha concluída</span>
            <div style={{ height: 7, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden", marginTop: 10 }}><div style={{ height: "100%", width: "32%", borderRadius: 999, background: "linear-gradient(90deg,var(--primary),#5a93f7)" }} /></div>
          </div>
        </section>

        <section className="proto-card courses-continue" style={{ background: "linear-gradient(150deg,var(--primary),#5a93f7)", boxShadow: "var(--shadow-lg)", padding: "clamp(22px,4vw,32px)", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "space-between", color: "#fff" }}>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <span style={{ display: "inline-flex", width: 56, height: 56, alignItems: "center", justifyContent: "center", borderRadius: 16, background: "rgba(255,255,255,.18)" }}><PlayCircle size={26} color="#fff" /></span>
            <div>
              <span style={{ fontSize: ".8rem", opacity: .9, fontWeight: 600 }}>Continuar de onde parou</span>
              <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: "1.35rem", margin: "4px 0 0" }}>Fundamentos de Análise de Dados</h3>
              <span style={{ fontSize: ".9rem", opacity: .92 }}>Aula 4 de 12 · 18 min restantes</span>
            </div>
          </div>
          <button className="proto-btn courses-continue-action" style={{ height: 50, background: "#fff", color: "var(--primary)", border: "none", fontWeight: 700 }}>Retomar curso</button>
        </section>

        <div className="proto-tabs" aria-label="Filtrar cursos">
          {[["todos", "Todos"], ["dados", "Dados"], ["design", "Design"], ["gestao", "Gestão"]].map(([key, label]) => (
            <button key={key} type="button" className={filter === key ? "active" : undefined} onClick={() => setFilter(key)}>{label}</button>
          ))}
        </div>

        <section className="courses-grid">
          {filtered.map((course) => {
            const color = colors[categoryOf(course)];
            const url = safeUrl(course.url);
            const hasUrl = Boolean(url);
            return (
              <a key={course.id} className="proto-card course-card-link" href={hasUrl ? url : "/cursos"} target={hasUrl ? "_blank" : undefined} rel={hasUrl ? "noreferrer" : undefined} aria-disabled={!hasUrl} onClick={(event) => { if (!hasUrl) event.preventDefault(); }} style={{ overflow: "hidden", cursor: hasUrl ? "pointer" : "not-allowed", display: "flex", flexDirection: "column" }}>
                <div style={{ height: 120, background: color, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>{iconFor(course.type)}<span style={{ position: "absolute", top: 12, right: 12, fontSize: ".7rem", fontWeight: 700, background: "rgba(255,255,255,.22)", color: "#fff", padding: "4px 10px", borderRadius: 999 }}>{course.isFree ? "Gratuito" : "Pago"}</span></div>
                <div style={{ padding: 20, display: "grid", gap: 9, flex: 1 }}>
                  <span style={{ fontSize: ".72rem", letterSpacing: ".06em", textTransform: "uppercase", color: "var(--primary)", fontWeight: 700 }}>{course.type}</span>
                  <strong style={{ fontSize: "1.08rem", lineHeight: 1.35 }}>{course.title}</strong>
                  <p style={{ margin: 0, color: "var(--muted)", fontSize: ".88rem", lineHeight: 1.5 }}>{course.provider}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: "auto", paddingTop: 8, color: "var(--faint)", fontSize: ".82rem", fontWeight: 600 }}><span>{hasUrl ? "Abrir conteúdo" : "Link ainda não cadastrado"} <ExternalLink size={14} /></span></div>
                </div>
              </a>
            );
          })}
        </section>
      </div>
    </main>
  );
}
