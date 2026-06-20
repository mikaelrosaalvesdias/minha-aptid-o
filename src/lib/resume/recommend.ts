import { resumeTemplates } from "./templates";
import type { ResumeData } from "./types";

function includesAny(text: string, words: string[]) {
  const normalized = text.toLowerCase();
  return words.some((word) => normalized.includes(word));
}

export function recommendResumeTemplates(input: {
  resume: ResumeData;
  targetArea?: string | null;
  targetRole?: string | null;
  useForAutoApply?: boolean;
  manualApply?: boolean;
  hasAtsJob?: boolean;
  wantsPhoto?: boolean;
}) {
  const areaText = [input.targetArea, input.targetRole, input.resume.title, ...(input.resume.topProfileNames ?? [])].filter(Boolean).join(" ").toLowerCase();
  const hasExperience = input.resume.experiences.some((exp) => exp.role || exp.company || exp.description);
  const lowExperience = !hasExperience || input.resume.experiences.filter((exp) => exp.role || exp.company).length <= 1;

  return resumeTemplates
    .map((template) => {
      let score = 0;
      const reasons: string[] = [];
      if (input.useForAutoApply || input.hasAtsJob) {
        if (template.atsCompatible) {
          score += template.baseAtsScore;
          reasons.push("Boa segurança para ATS e candidatura automática.");
        } else {
          score += template.baseAtsScore - 25;
          reasons.push("Visual forte, mas exige cuidado em plataformas automáticas.");
        }
      } else if (input.manualApply) {
        score += template.baseRhScore + template.baseVisualScore * 0.4;
        reasons.push("Boa opção para envio manual e leitura por RH.");
      } else {
        score += template.baseRhScore + template.baseAtsScore * 0.5;
      }
      if (includesAny(areaText, ["marketing", "social", "design", "criativ", "comunica"]) && template.id === "marketing-criativo") {
        score += 35;
        reasons.push("Combina com áreas criativas e comunicação.");
      }
      if (includesAny(areaText, ["venda", "comercial", "sdr", "atendimento", "consultor"]) && template.id === "comercial-vendas") {
        score += 35;
        reasons.push("Valoriza resultados, metas e negociação.");
      }
      if (includesAny(areaText, ["tecnologia", "desenvol", "dados", "suporte", "qa", "produto"]) && template.id === "tecnologia") {
        score += 35;
        reasons.push("Destaca habilidades técnicas e projetos.");
      }
      if (includesAny(areaText, ["admin", "financeiro", "recep", "escritório"]) && template.id === "administrativo") {
        score += 30;
        reasons.push("Estrutura clara para áreas administrativas.");
      }
      if (lowExperience && ["primeiro-emprego", "estagio", "jovem-aprendiz", "destaque-habilidades"].includes(template.id)) {
        score += 28;
        reasons.push("Ajuda quando há pouca experiência formal.");
      }
      if (input.wantsPhoto && template.acceptsPhoto) score += 8;
      if (!input.wantsPhoto && !template.acceptsPhoto) score += 6;
      if (input.useForAutoApply && template.id === "ats-limpo") score += 30;
      return { template, score: Math.round(score), reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}
