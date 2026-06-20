import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

type ChangelogVersion = {
  version: string;
  date: string | null;
  sections: { title: string; items: string[] }[];
};

// Faz parsing leve do CHANGELOG.md (formato Keep a Changelog).
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

export async function GET() {
  try {
    const root = process.cwd();
    const [versionFile, changelogFile] = await Promise.all([
      readFile(join(root, "VERSION"), "utf-8").catch(() => "0.0.0"),
      readFile(join(root, "CHANGELOG.md"), "utf-8").catch(() => "")
    ]);

    const version = versionFile.trim();
    const { versions } = parseChangelog(changelogFile);

    return NextResponse.json({ version, versions });
  } catch (error) {
    await logError("Falha ao carregar versão/changelog", { error: String(error) });
    return NextResponse.json({ version: "0.0.0", versions: [] });
  }
}
