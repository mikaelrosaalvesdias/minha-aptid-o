import type { JobPreferenceInput, RawJob } from "./types";

type ScoreContext = {
  topProfileNames: string[];
  strengths: string[];
  keywords: string[];
  preference: JobPreferenceInput;
};

type ScoreResult = {
  score: number;
  reason: string;
  block?: string;
};

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function includesAny(haystack: string, needles: string[]): string[] {
  const hits: string[] = [];
  for (const needle of needles) {
    const n = norm(needle);
    if (n && haystack.includes(n)) hits.push(needle);
  }
  return hits;
}

function parseSalary(text?: string): number | null {
  if (!text) return null;
  const clean = norm(text).replace(/\./g, "").replace(",", ".");
  const match = clean.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const value = parseFloat(match[1]);
  if (clean.includes("mil")) return value * 1000;
  return value;
}

// Nota simples de compatibilidade 0-100 usando dados JÁ EXISTENTES:
// aptidão (topProfileNames + strengths + keywords) + preferências.
// Não cria nova lógica de teste de aptidão.
export function compatibilityScore(job: RawJob, ctx: ScoreContext): ScoreResult {
  const pref = ctx.preference;
  const haystack = norm([job.title, job.company, job.description, job.city, job.state].filter(Boolean).join(" "));

  const reasons: string[] = [];
  const blocks: string[] = [];
  let score = 40;

  // 1) Afinidade com área de aptidão (peso alto)
  const areaHits = includesAny(haystack, ctx.topProfileNames);
  if (areaHits.length > 0) {
    score += 25 * Math.min(areaHits.length, 2);
    reasons.push(`Alta afinidade com ${areaHits.slice(0, 2).join(" e ")}`);
  }

  // 2) Forças detectadas no teste
  const strengthHits = includesAny(haystack, ctx.strengths);
  if (strengthHits.length > 0) {
    score += 3 * Math.min(strengthHits.length, 4);
    if (reasons.length === 0) reasons.push(`Combina com forças: ${strengthHits.slice(0, 3).join(", ")}`);
  }

  // 3) Palavras-chave desejadas pelo usuário
  const desiredHits = includesAny(haystack, pref.keywordsDesejadas);
  if (desiredHits.length > 0) {
    score += 4 * Math.min(desiredHits.length, 5);
    reasons.push(`Contém palavras-chave desejadas: ${desiredHits.slice(0, 3).join(", ")}`);
  }

  // 4) Cargo/área pretendida
  if (pref.cargo && includesAny(haystack, [pref.cargo]).length > 0) {
    score += 10;
    reasons.push(`Cargo compatível com "${pref.cargo}"`);
  }
  if (pref.area && includesAny(haystack, [pref.area]).length > 0) {
    score += 8;
  }

  // 5) Modelo de trabalho
  if (pref.modelo !== "qualquer") {
    if (job.modelo && norm(job.modelo) === norm(pref.modelo)) {
      score += 8;
      reasons.push(`Modelo ${job.modelo} dentro da preferência`);
    } else if (job.modelo && norm(job.modelo) !== norm(pref.modelo)) {
      score -= 6;
      blocks.push(`Modelo ${job.modelo} diferente do preferido (${pref.modelo})`);
    }
  }

  // 6) Localização
  if (pref.cidade && job.city) {
    if (norm(job.city).includes(norm(pref.cidade))) {
      score += 6;
    } else if (!pref.aceitaForaCidade) {
      score -= 15;
      blocks.push(`Fora da cidade desejada (${pref.cidade})`);
    }
  }

  // 7) Salário
  if (pref.salarioMin || pref.salarioMax) {
    const salary = parseSalary(job.salario);
    if (salary != null) {
      if (pref.salarioMin && salary < pref.salarioMin) {
        score -= 10;
        blocks.push(`Salário abaixo da pretensão mínima`);
      } else if (pref.salarioMax && salary > pref.salarioMax) {
        score += 0;
      } else {
        score += 6;
        reasons.push("Dentro da pretensão salarial");
      }
    } else if (!pref.aceitaSemSalario) {
      score -= 5;
    }
  }

  // 8) Palavras-chave a evitar
  const avoidHits = includesAny(haystack, pref.keywordsEvitar);
  if (avoidHits.length > 0) {
    score -= 8 * avoidHits.length;
    blocks.push(`Contém termos a evitar: ${avoidHits.slice(0, 2).join(", ")}`);
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  const reason = reasons.length > 0 ? reasons.slice(0, 2).join(". ") + "." : "Vaga dentro da sua área de interesse.";
  const block = blocks.length > 0 ? blocks.join("; ") : undefined;

  return { score, reason, block };
}
