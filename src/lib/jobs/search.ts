import { createHash } from "crypto";
import { logError } from "../logging";
import { buildBoardSearchUrls, sourceInfo } from "./sources";
import { compatibilityScore } from "./compatibility";
import { searchAllATS, atsResultToRawJob, detectATSFromUrl } from "./ats";
import type { JobPreferenceInput, RawJob, ScoredJob, SourceAutoSupport } from "./types";

type RemotiveJob = {
  id?: number;
  title?: string;
  company_name?: string;
  candidate_required_location?: string;
  job_type?: string;
  salary?: string;
  description?: string;
  url?: string;
  publication_date?: string;
  tags?: string[];
};

// Deduplicação: link original + título + empresa + cidade + estado + fonte.
export function dedupHash(job: {
  originalUrl: string;
  title: string;
  company?: string;
  city?: string;
  state?: string;
  source: string;
}): string {
  const key = [
    job.source,
    job.originalUrl,
    job.title.toLowerCase().trim(),
    (job.company ?? "").toLowerCase().trim(),
    (job.city ?? "").toLowerCase().trim(),
    (job.state ?? "").toLowerCase().trim()
  ].join("|");
  return createHash("sha1").update(key).digest("hex").slice(0, 24);
}

function normalizeModelo(jobType?: string): string | undefined {
  if (!jobType) return undefined;
  const t = jobType.toLowerCase();
  if (t.includes("remote") || t.includes("remoto")) return "remoto";
  if (t.includes("hybrid") || t.includes("hibrido")) return "hibrido";
  if (t.includes("onsite") || t.includes("presencial")) return "presencial";
  return undefined;
}

// Busca real na API pública da Remotive (gratuita, sem chave).
async function searchRemotive(pref: JobPreferenceInput): Promise<RawJob[]> {
  const base = "https://remotive.com/api/remote-jobs";
  const url = new URL(base);
  const term = [pref.cargo, pref.area, ...(pref.keywordsDesejadas ?? [])]
    .filter(Boolean)
    .map((s) => String(s).trim())
    .filter(Boolean)
    .join(" ")
    .trim();

  if (term) url.searchParams.set("search", term);
  url.searchParams.set("limit", "40");

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 * 30 }
    });
    if (!res.ok) throw new Error(`Remotive respondeu ${res.status}`);
    const data = (await res.json()) as { jobs?: RemotiveJob[] };
    const jobs = data.jobs ?? [];

    return jobs
      .filter((j) => j.title && j.url)
      .map((j) => ({
        title: j.title as string,
        company: j.company_name ?? undefined,
        city: undefined,
        state: undefined,
        modelo: normalizeModelo(j.job_type) ?? "remoto",
        salario: j.salary && j.salary.trim() ? j.salary.trim() : undefined,
        contrato: undefined,
        nivel: undefined,
        description: j.description ? j.description.replace(/<[^>]+>/g, "").slice(0, 1200) : undefined,
        requisitos: j.tags ?? [],
        beneficios: [],
        originalUrl: j.url as string,
        source: "remotive",
        publishedAt: j.publication_date ? new Date(j.publication_date) : null,
        confidence: 0.8
      }));
  } catch (error) {
    await logError("Falha na busca Remotive", { error: String(error) });
    return [];
  }
}

// Busca real na API pública da RemoteOK (gratuita, sem chave).
async function searchRemoteOK(pref: JobPreferenceInput): Promise<RawJob[]> {
  const term = [pref.cargo, pref.area, ...(pref.keywordsDesejadas ?? [])]
    .filter(Boolean)
    .map((s) => String(s).trim())
    .filter(Boolean)
    .join(" ")
    .trim();

  try {
    const res = await fetch("https://remoteok.com/api", {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 * 30 }
    });
    if (!res.ok) throw new Error(`RemoteOK respondeu ${res.status}`);
    const data = (await res.json()) as Array<{
      slug?: string;
      id?: number;
      company?: string;
      position?: string;
      tags?: string[];
      description?: string;
      location?: string;
      url?: string;
      salary?: string;
    }>;

    const termLower = term.toLowerCase();
    const jobs = data
      .filter((j) => j.position && j.url)
      .filter((j) => !termLower || j.position!.toLowerCase().includes(termLower) || j.tags?.some((t) => t.toLowerCase().includes(termLower)))
      .slice(0, 30);

    return jobs.map((j) => ({
      title: j.position as string,
      company: j.company ?? undefined,
      city: undefined,
      state: undefined,
      modelo: "remoto",
      salario: j.salary && j.salary.trim() ? j.salary.trim() : undefined,
      contrato: undefined,
      nivel: undefined,
      description: j.description ? j.description.replace(/<[^>]+>/g, "").slice(0, 1200) : undefined,
      requisitos: j.tags ?? [],
      beneficios: [],
      originalUrl: j.url as string,
      source: "remoteok",
      publishedAt: new Date(),
      confidence: 0.8
    }));
  } catch (error) {
    await logError("Falha na busca RemoteOK", { error: String(error) });
    return [];
  }
}

// Busca curada: gera vagas-referência a partir de portais BR (links reais).
function searchCurated(pref: JobPreferenceInput): RawJob[] {
  const links = buildBoardSearchUrls({
    cargo: pref.cargo,
    area: pref.area,
    cidade: pref.cidade,
    estado: pref.estado,
    modelo: pref.modelo,
    keywords: pref.keywordsDesejadas
  });

  return links.map((link) => ({
    title: link.title,
    company: sourceInfo(link.source).label,
    city: pref.cidade ?? undefined,
    state: pref.estado ?? undefined,
    modelo: pref.modelo !== "qualquer" ? pref.modelo : undefined,
    salario: undefined,
    contrato: pref.contrato !== "qualquer" ? pref.contrato : undefined,
    nivel: pref.nivel !== "qualquer" ? pref.nivel : undefined,
    description: `Oportunidades de "${pref.cargo || pref.area || "vaga"}" em ${sourceInfo(link.source).label}. Abra o link para ver as vagas disponíveis e se candidatar.`,
    requisitos: [],
    beneficios: [],
    originalUrl: link.url,
    source: link.source,
    publishedAt: new Date(),
    confidence: 0.5
  }));
}

export async function searchJobs(pref: JobPreferenceInput): Promise<{
  raw: RawJob[];
  sources: string[];
  atsMeta: Map<string, { board: string; jobId: string }>;
}> {
  const term = [pref.cargo, pref.area, ...(pref.keywordsDesejadas ?? [])]
    .filter(Boolean)
    .map((s) => String(s).trim())
    .filter(Boolean)
    .join(" ")
    .trim();

  const [remotive, remoteok, curated, atsResults] = await Promise.all([
    searchRemotive(pref),
    searchRemoteOK(pref),
    Promise.resolve(searchCurated(pref)),
    searchAllATS(term)
  ]);

  const atsRaw = atsResults.map(atsResultToRawJob);

  const atsMeta = new Map<string, { board: string; jobId: string }>();
  for (const r of atsResults) {
    atsMeta.set(r.originalUrl, { board: r.atsBoard, jobId: r.atsJobId });
  }

  // Detecta ATS em vagas de outras fontes (ex: Remotive/RemoteOK que linkam para Greenhouse/Lever)
  for (const job of [...remotive, ...remoteok, ...curated]) {
    const detected = detectATSFromUrl(job.originalUrl);
    if (detected) {
      job.source = detected.source;
      atsMeta.set(job.originalUrl, { board: detected.atsBoard ?? "", jobId: detected.atsJobId ?? "" });
    }
  }

  const raw = [...remotive, ...remoteok, ...atsRaw, ...curated];
  const sources = Array.from(new Set(raw.map((j) => j.source)));
  return { raw, sources, atsMeta };
}

// Marca sourceAutoSupport e calcula nota de compatibilidade.
export function scoreAndStamp(
  raw: RawJob[],
  ctx: {
    topProfileNames: string[];
    strengths: string[];
    keywords: string[];
    preference: JobPreferenceInput;
  },
  atsMeta?: Map<string, { board: string; jobId: string }>
): ScoredJob[] {
  return raw.map((job) => {
    const info = sourceInfo(job.source);
    const support: SourceAutoSupport = info.autoSupport;
    const score = compatibilityScore(job, ctx);
    const meta = atsMeta?.get(job.originalUrl);
    return {
      ...job,
      dedupHash: dedupHash(job),
      sourceAutoSupport: support,
      compatibilityScore: score.score,
      compatibilityReason: score.reason,
      compatibilityBlock: score.block,
      atsBoard: meta?.board,
      atsJobId: meta?.jobId
    };
  });
}
