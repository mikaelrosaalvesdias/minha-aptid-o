import { readFileSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

type ChangelogVersion = { version: string; date: string | null; sections: { title: string; items: string[] }[] };

function parseChangelog(markdown: string): { versions: ChangelogVersion[] } {
  const versions: ChangelogVersion[] = [];
  const lines = markdown.split("\n");
  let current: ChangelogVersion | null = null;
  for (const line of lines) {
    const versionMatch = line.match(/^##\s+\[([^\]]+)\](?:\s*-\s*(.+))?$/);
    if (versionMatch) {
      if (current) versions.push(current);
      current = { version: versionMatch[1], date: versionMatch[2]?.trim() ?? null, sections: [] };
      continue;
    }
    if (!current) continue;
    const sectionMatch = line.match(/^###\s+(.+)$/);
    if (sectionMatch) { current.sections.push({ title: sectionMatch[1].trim(), items: [] }); continue; }
    const itemMatch = line.match(/^\s*-\s+(.+)$/);
    if (itemMatch && current.sections.length > 0) current.sections[current.sections.length - 1].items.push(itemMatch[1].trim());
  }
  if (current) versions.push(current);
  return { versions };
}

export default async function SobrePage() {
  let version = "0.0.0";
  let versions: ChangelogVersion[] = [];
  try {
    const root = process.cwd();
    version = readFileSync(join(root, "VERSION"), "utf-8").trim();
    const changelog = readFileSync(join(root, "CHANGELOG.md"), "utf-8");
    versions = parseChangelog(changelog).versions;
  } catch {}

  return (
    <main style={{ maxWidth: 840, margin: "0 auto", padding: "clamp(34px,6vw,72px) clamp(20px,5vw,40px)", display: "grid", gap: 24 }}>
      <span style={{ fontSize: ".8rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--primary)", fontWeight: 700 }}>Sobre</span>
      <h1 style={{ fontFamily: "var(--font-head)", fontWeight: 500, fontSize: "clamp(2.2rem,4.6vw,3.4rem)", lineHeight: 1.1, letterSpacing: "-0.025em", margin: 0 }}>Ajudar pessoas a encontrarem caminhos com mais clareza.</h1>
      <p style={{ margin: 0, color: "var(--muted)", fontSize: "1.12rem", lineHeight: 1.7 }}>O Minha Aptidão é uma plataforma gratuita de orientação profissional. Combinamos um teste de aptidão, recomendações de estudo, um editor profissional de currículo e uma área de vagas compatíveis com o seu perfil.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, margin: "10px 0" }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, boxShadow: "var(--shadow-card)", padding: 24, display: "grid", gap: 9 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          <strong style={{ fontSize: "1.05rem" }}>Autoconhecimento</strong>
          <span style={{ color: "var(--muted)", fontSize: ".92rem", lineHeight: 1.5 }}>Entenda suas forças e o que combina com você.</span>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, boxShadow: "var(--shadow-card)", padding: 24, display: "grid", gap: 9 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
          <strong style={{ fontSize: "1.05rem" }}>Gratuito</strong>
          <span style={{ color: "var(--muted)", fontSize: ".92rem", lineHeight: 1.5 }}>Acessível para todos, sem cobrança.</span>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, boxShadow: "var(--shadow-card)", padding: 24, display: "grid", gap: 9 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          <strong style={{ fontSize: "1.05rem" }}>Seguro</strong>
          <span style={{ color: "var(--muted)", fontSize: ".92rem", lineHeight: 1.5 }}>Seus dados pertencem a você.</span>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", padding: "20px 24px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16 }}>
        <span style={{ fontWeight: 600, fontSize: ".95rem" }}>Versão atual</span>
        <span style={{ fontFamily: "var(--font-head)", fontWeight: 600, color: "var(--primary)", fontSize: "1.1rem" }}>{version}</span>
        <span style={{ color: "var(--faint)", fontSize: ".9rem", marginLeft: "auto" }}>Veja o changelog completo abaixo</span>
      </div>

      <p style={{ margin: 0, color: "var(--faint)", fontSize: ".9rem", lineHeight: 1.6 }}>O Minha Aptidão não substitui orientação psicológica, clínica ou vocacional profissional. É uma ferramenta de apoio ao autoconhecimento e à busca por oportunidades.</p>

      <div style={{ display: "grid", gap: 18, marginTop: 8 }}>
        {versions.map((v) => (
          <div key={v.version} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, boxShadow: "var(--shadow-card)", padding: "clamp(20px,4vw,28px)", display: "grid", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontFamily: "var(--font-head)", fontWeight: 600 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", borderRadius: 99, background: "var(--primary-soft)", color: "var(--primary)", fontSize: ".85rem", fontWeight: 700 }}>v{v.version}</span>
              </h3>
              {v.date && <span style={{ color: "var(--faint)", fontSize: ".85rem" }}>{new Date(v.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span>}
            </div>
            {v.sections.map((section) => (
              <div key={section.title}>
                <h4 style={{ margin: "0 0 8px", fontSize: ".95rem", fontWeight: 700, color: section.title === "Adicionado" ? "var(--success)" : section.title === "Corrigido" ? "var(--primary)" : section.title === "Removido" ? "var(--danger)" : "var(--muted)" }}>{section.title}</h4>
                <ul style={{ margin: 0, paddingLeft: 18, color: "var(--muted)", lineHeight: 1.7, fontSize: ".9rem", display: "grid", gap: 6 }}>
                  {section.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
