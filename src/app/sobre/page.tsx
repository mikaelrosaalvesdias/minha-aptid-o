import Link from "next/link";
import { ArrowLeft, Tag, Calendar, Sparkles, Wrench, Trash2, RefreshCw, ShieldCheck } from "lucide-react";
import { readFileSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

type ChangelogVersion = {
  version: string;
  date: string | null;
  sections: { title: string; items: string[] }[];
};

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
    if (sectionMatch) {
      current.sections.push({ title: sectionMatch[1].trim(), items: [] });
      continue;
    }

    const itemMatch = line.match(/^\s*-\s+(.+)$/);
    if (itemMatch && current.sections.length > 0) {
      current.sections[current.sections.length - 1].items.push(itemMatch[1].trim());
    }
  }
  if (current) versions.push(current);
  return { versions };
}

const SECTION_ICONS: Record<string, typeof Sparkles> = {
  Adicionado: Sparkles,
  Corrigido: Wrench,
  Alterado: RefreshCw,
  Removido: Trash2,
  Segurança: ShieldCheck
};

export default async function SobrePage() {
  let version = "0.0.0";
  let versions: ChangelogVersion[] = [];
  try {
    const root = process.cwd();
    version = readFileSync(join(root, "VERSION"), "utf-8").trim();
    const changelog = readFileSync(join(root, "CHANGELOG.md"), "utf-8");
    versions = parseChangelog(changelog).versions;
  } catch {}

  const latest = versions[0];

  return (
    <main className="page-shell" style={{ padding: "clamp(40px, 6vw, 80px) 0", display: "grid", gap: 24, maxWidth: 820 }}>
      <Link href="/perfil" className="button ghost" style={{ alignSelf: "flex-start" }}>
        <ArrowLeft size={18} /> Voltar ao Perfil
      </Link>

      <div className="card" style={{ padding: "clamp(28px, 5vw, 44px)", display: "grid", gap: 18 }}>
        <p className="eyebrow">Sobre o app</p>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 3rem)" }}>Mapa de Aptidão</h1>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
          <span className="pill" style={{ fontSize: "1rem", padding: "8px 18px" }}>
            <Tag size={16} /> Versão {version}
          </span>
          {latest?.date && (
            <span className="muted" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Calendar size={16} /> Última atualização em {new Date(latest.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </span>
          )}
        </div>
        <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
          Ferramenta de orientação e autoconhecimento profissional. Descubra áreas que combinam com você,
          gere seu currículo, receba cursos gratuitos e agora também busque vagas compatíveis com seu perfil.
        </p>
        <p className="muted" style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.6 }}>
          Não substitui acompanhamento psicológico, clínico ou orientação vocacional definitiva.
        </p>
      </div>

      <div style={{ display: "grid", gap: 18 }}>
        <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Histórico de versões</h2>

        {versions.map((v) => (
          <div key={v.version} className="card" style={{ padding: "clamp(24px, 4vw, 32px)", display: "grid", gap: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <h3 style={{ margin: 0, fontSize: "1.3rem" }}>
                <span className="pill" style={{ marginRight: 12 }}>v{v.version}</span>
              </h3>
              {v.date && (
                <span className="muted" style={{ fontSize: "0.9rem" }}>
                  {new Date(v.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                </span>
              )}
            </div>

            {v.sections.map((section) => {
              const Icon = SECTION_ICONS[section.title] ?? Sparkles;
              const color =
                section.title === "Adicionado" ? "#6ee7b7" :
                section.title === "Corrigido" ? "#93c5fd" :
                section.title === "Removido" ? "#fca5a5" :
                section.title === "Segurança" ? "#fca5a5" : "#c4b5fd";
              return (
                <div key={section.title}>
                  <h4 style={{ margin: "0 0 12px", display: "flex", alignItems: "center", gap: 10, color, fontSize: "1rem" }}>
                    <Icon size={18} /> {section.title}
                  </h4>
                  <ul className="clean-list" style={{ paddingLeft: 24 }}>
                    {section.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </main>
  );
}
