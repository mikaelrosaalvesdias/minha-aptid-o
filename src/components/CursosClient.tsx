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
  { id: "sample-dados", title: "Fundamentos de Análise de Dados", provider: "Minha Aptidão", url: "", type: "Dados · Iniciante", isFree: true, profileSlug: "dados" },
  { id: "sample-sql", title: "Introdução a SQL", provider: "Minha Aptidão", url: "", type: "Dados · Iniciante", isFree: true, profileSlug: "dados" },
  { id: "sample-ux", title: "UX para quem vem de dados", provider: "Minha Aptidão", url: "", type: "Design · Intermediário", isFree: false, profileSlug: "design" },
  { id: "sample-gestao", title: "Gestão de Projetos na prática", provider: "Minha Aptidão", url: "", type: "Gestão · Iniciante", isFree: true, profileSlug: "gestao" }
];

const colors: Record<string, string> = {
  dados: "linear-gradient(135deg,#2563eb,#5a93f7)",
  design: "linear-gradient(135deg,#7c3aed,#a78bfa)",
  gestao: "linear-gradient(135deg,#c47e07,#fbbf24)",
  dados2: "linear-gradient(135deg,#0ea371,#34d399)"
};

function iconFor(type: string) {
  if (type.toLowerCase().includes("sql")) return <Star size={42} color="#fff" />;
  if (type.toLowerCase().includes("design")) return <Target size={42} color="#fff" />;
  if (type.toLowerCase().includes("gest")) return <Clock size={42} color="#fff" />;
  return <BarChart2 size={42} color="#fff" />;
}

function categoryOf(type: string) {
  const lower = type.toLowerCase();
  if (lower.includes("design")) return "design";
  if (lower.includes("gest")) return "gestao";
  if (lower.includes("sql")) return "dados2";
  return "dados";
}

export function CursosClient({ initialCourses, profileNames }: CourseClientProps) {
  const [filter, setFilter] = useState("todos");
  const courses = initialCourses.length ? initialCourses : sampleCourses;
  const filtered = filter === "todos" ? courses : courses.filter((course) => course.profileSlug === filter || categoryOf(course.type) === filter);
  const title = profileNames[0] ? `Cursos para ${profileNames[0]}` : "Cursos para o seu perfil";

  return (
    <main className="ambient-shell">
      <div className="ambient-content proto-shell" style={{ display: "grid", gap: 24 }}>
        <section style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "end" }}>
          <div>
            <p className="proto-eyebrow">Trilha de aprendizado</p>
            <h1 className="proto-title" style={{ fontSize: "clamp(1.9rem,3.6vw,2.7rem)" }}>{title}</h1>
            <p className="proto-subtitle" style={{ maxWidth: 560 }}>Conteúdos gratuitos e pagos, selecionados a partir das suas aptidões. Comece no seu ritmo.</p>
          </div>
          <div className="proto-card" style={{ padding: "20px 24px", textAlign: "center", minWidth: 160 }}>
            <div style={{ fontFamily: "var(--font-head)", fontSize: "2rem", fontWeight: 600, color: "var(--primary)", lineHeight: 1 }}>32%</div>
            <span style={{ fontSize: ".82rem", color: "var(--muted)", fontWeight: 600 }}>da sua trilha concluída</span>
            <div style={{ height: 7, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden", marginTop: 10 }}><div style={{ height: "100%", width: "32%", borderRadius: 999, background: "linear-gradient(90deg,var(--primary),#5a93f7)" }} /></div>
          </div>
        </section>

        <section className="proto-card" style={{ background: "linear-gradient(150deg,var(--primary),#5a93f7)", boxShadow: "var(--shadow-lg)", padding: "clamp(22px,4vw,32px)", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "space-between", color: "#fff" }}>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <span style={{ display: "inline-flex", width: 56, height: 56, alignItems: "center", justifyContent: "center", borderRadius: 16, background: "rgba(255,255,255,.18)" }}><PlayCircle size={26} color="#fff" /></span>
            <div>
              <span style={{ fontSize: ".8rem", opacity: .9, fontWeight: 600 }}>Continuar de onde parou</span>
              <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: "1.35rem", margin: "4px 0 0" }}>Fundamentos de Análise de Dados</h3>
              <span style={{ fontSize: ".9rem", opacity: .92 }}>Aula 4 de 12 · 18 min restantes</span>
            </div>
          </div>
          <button className="proto-btn" style={{ height: 50, background: "#fff", color: "var(--primary)", border: "none", fontWeight: 700 }}>Retomar curso</button>
        </section>

        <div className="proto-tabs">
          {[["todos", "Todos"], ["dados", "Dados"], ["design", "Design"], ["gestao", "Gestão"]].map(([key, label]) => (
            <button key={key} type="button" className={filter === key ? "active" : undefined} onClick={() => setFilter(key)}>{label}</button>
          ))}
        </div>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 }}>
          {filtered.map((course) => {
            const color = colors[categoryOf(course.type)];
            return (
              <a key={course.id} className="proto-card" href={course.url || "#"} target={course.url ? "_blank" : undefined} rel="noreferrer" style={{ overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column" }}>
                <div style={{ height: 120, background: color, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>{iconFor(course.type)}<span style={{ position: "absolute", top: 12, right: 12, fontSize: ".7rem", fontWeight: 700, background: "rgba(255,255,255,.22)", color: "#fff", padding: "4px 10px", borderRadius: 999 }}>{course.isFree ? "Gratuito" : "Pago"}</span></div>
                <div style={{ padding: 20, display: "grid", gap: 9, flex: 1 }}>
                  <span style={{ fontSize: ".72rem", letterSpacing: ".06em", textTransform: "uppercase", color: "var(--primary)", fontWeight: 700 }}>{course.type}</span>
                  <strong style={{ fontSize: "1.08rem", lineHeight: 1.35 }}>{course.title}</strong>
                  <p style={{ margin: 0, color: "var(--muted)", fontSize: ".88rem", lineHeight: 1.5 }}>{course.provider}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: "auto", paddingTop: 8, color: "var(--faint)", fontSize: ".82rem", fontWeight: 600 }}><span>{course.url ? "Abrir conteúdo" : "Acessar quando disponível"} <ExternalLink size={14} /></span></div>
                </div>
              </a>
            );
          })}
        </section>
      </div>
    </main>
  );
}
