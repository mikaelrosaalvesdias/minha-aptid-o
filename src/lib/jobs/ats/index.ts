import { applyToGreenhouse, searchGreenhouse } from "./greenhouse";
import { applyToLever, searchLever } from "./lever";
import type { RawJob } from "../types";
import { logError } from "../../logging";

export type ATSResume = {
  name: string;
  email: string;
  phone?: string;
  summary?: string;
  strengths?: string[];
  topProfileNames?: string[];
};

export type ATSSearchResult = {
  source: string;
  atsBoard: string;
  atsJobId: string;
  title: string;
  company: string;
  city?: string;
  state?: string;
  modelo?: string;
  description?: string;
  originalUrl: string;
  sourceAutoSupport: "auto" | "requires_employer_auth";
  confidence: number;
};

// Busca em todos os ATS suportados simultaneamente.
export async function searchAllATS(term: string): Promise<ATSSearchResult[]> {
  try {
    const [greenhouse, lever] = await Promise.all([
      searchGreenhouse(term),
      searchLever(term)
    ]);
    return [...greenhouse, ...lever];
  } catch (error) {
    await logError("Falha na busca ATS", { error: String(error) });
    return [];
  }
}

// Despacha a candidatura para o ATS correto conforme a fonte.
// Retorna success=true quando o POST foi aceito pela API pública.
export async function applyViaATS(
  source: string,
  atsBoard: string | null,
  atsJobId: string | null,
  resume: ATSResume
): Promise<{ success: boolean; error?: string }> {
  if (!atsJobId) {
    return { success: false, error: "ID da vaga no ATS não encontrado." };
  }

  if (source === "greenhouse") {
    if (!atsBoard) return { success: false, error: "Board Greenhouse não encontrado." };
    return applyToGreenhouse(atsBoard, atsJobId, resume);
  }

  if (source === "lever") {
    return applyToLever(atsJobId, resume);
  }

  return { success: false, error: `ATS não suportado: ${source}` };
}

// Detecta se uma URL é de um ATS conhecido (para marcar vagas de outras fontes).
export function detectATSFromUrl(url: string): { source: string; atsBoard?: string; atsJobId?: string } | null {
  const lower = url.toLowerCase();

  const greenhouseMatch = lower.match(/greenhouse\.io\/(?:boards\/)?([^/]+)\/jobs\/(\d+)/) ||
    lower.match(/boards-api\.greenhouse\.io\/v1\/boards\/([^/]+)\/jobs\/(\d+)/);
  if (greenhouseMatch) {
    return { source: "greenhouse", atsBoard: greenhouseMatch[1], atsJobId: greenhouseMatch[2] };
  }

  const leverMatch = lower.match(/lever\.co\/([^/]+)\/posting\/([a-f0-9-]+)/) ||
    lower.match(/jobs\.lever\.co\/([^/]+)\/([a-f0-9-]+)/);
  if (leverMatch) {
    return { source: "lever", atsBoard: leverMatch[1], atsJobId: leverMatch[2] };
  }

  return null;
}

// Converte resultado de busca ATS para o formato RawJob usado pelo pipeline.
export function atsResultToRawJob(r: ATSSearchResult): RawJob {
  return {
    title: r.title,
    company: r.company,
    city: r.city,
    state: r.state,
    modelo: r.modelo,
    salario: undefined,
    contrato: undefined,
    nivel: undefined,
    description: r.description,
    requisitos: [],
    beneficios: [],
    originalUrl: r.originalUrl,
    source: r.source,
    publishedAt: new Date(),
    confidence: r.confidence
  };
}
