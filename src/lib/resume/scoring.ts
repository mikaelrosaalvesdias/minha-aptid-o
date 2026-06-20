import { defaultSectionConfig, getResumeTemplate } from "./templates";
import type { ResumeData, ResumeScores, ResumeSectionConfig, ResumeSuggestion, ResumeTemplate, ResumeVisualConfig } from "./types";

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

function isFilled(value?: string | null) {
  return Boolean(value && value.trim().length > 0);
}

function hasMeaningfulExperience(resume: ResumeData) {
  return resume.experiences.some((exp) => isFilled(exp.role) || isFilled(exp.company) || isFilled(exp.description));
}

function hasCompleteExperience(resume: ResumeData) {
  return resume.experiences.some((exp) => isFilled(exp.role) && isFilled(exp.company) && isFilled(exp.period) && isFilled(exp.description));
}

function hasEducation(resume: ResumeData) {
  return resume.education.some((edu) => isFilled(edu.course) || isFilled(edu.institution));
}

function wordCount(text?: string | null) {
  return (text ?? "").trim().split(/\s+/).filter(Boolean).length;
}

function hasActionVerb(text: string) {
  return /\b(implementei|coordenei|liderei|organizei|atendi|vendi|criei|desenvolvi|analisei|melhorei|reduzi|aumentei|otimizei|gerenciei|apoiei|executei)\b/i.test(text);
}

function hasNumber(text: string) {
  return /\d+|%|por cento|mil|milhão|clientes|vendas|metas/i.test(text);
}

function contrastRisk(config: ResumeVisualConfig) {
  const weak = ["#fef3c7", "#fde68a", "#fbcfe8", "#ddd6fe", "#bfdbfe", "#ffffff"];
  return weak.includes(config.textColor.toLowerCase()) || weak.includes(config.primaryColor.toLowerCase()) && config.backgroundColor.toLowerCase() !== "#ffffff";
}

export function buildResumeSuggestions(input: {
  resume: ResumeData;
  template: ResumeTemplate;
  visualConfig: ResumeVisualConfig;
  sectionConfig?: ResumeSectionConfig;
  useForAutoApply?: boolean;
  targetArea?: string | null;
}): ResumeSuggestion[] {
  const suggestions: ResumeSuggestion[] = [];
  const { resume, template, visualConfig, useForAutoApply } = input;
  const experience = hasMeaningfulExperience(resume);
  const education = hasEducation(resume);
  const summaryWords = wordCount(resume.summary);
  const expText = resume.experiences.map((exp) => exp.description).join(" ");

  if (!isFilled(resume.phone)) {
    suggestions.push({ id: "missing-phone", priority: "alta", area: "completude", title: "Falta telefone", description: "Inclua um telefone para recrutadores conseguirem contato direto.", actionLabel: "Corrigir agora", action: "phone" });
  }
  if (!experience) {
    suggestions.push({ id: "missing-experience", priority: "alta", area: "conteúdo", title: "Falta experiência ou alternativa", description: "Inclua experiências reais. Se for primeiro emprego, destaque cursos, projetos, trabalho voluntário ou habilidades.", actionLabel: "Corrigir agora", action: "experience" });
  }
  if (!education) {
    suggestions.push({ id: "missing-education", priority: "alta", area: "conteúdo", title: "Falta formação", description: "Adicione sua formação acadêmica, curso técnico ou escolaridade atual.", actionLabel: "Corrigir agora", action: "education" });
  }
  if (useForAutoApply && !template.atsCompatible) {
    suggestions.push({ id: "bad-ats-template", priority: "alta", area: "ats", title: "Template inadequado para candidatura automática", description: "Para plataformas automáticas, prefira ATS Limpo, Sem Foto, Preto e Branco ou Minimalista.", actionLabel: "Trocar template", action: "templates" });
  }
  if (summaryWords < 20) {
    suggestions.push({ id: "short-summary", priority: "média", area: "rh", title: "Resumo profissional curto ou ausente", description: "Escreva 3 a 5 linhas com sua área, experiências reais, principais habilidades e objetivo.", actionLabel: "Corrigir agora", action: "summary" });
  }
  if (experience && !hasNumber(expText)) {
    suggestions.push({ id: "missing-results", priority: "média", area: "rh", title: "Inclua resultados mensuráveis se forem verdadeiros", description: "Melhore experiências com dados reais, como clientes atendidos, metas batidas, redução de tempo ou volume de atividades.", actionLabel: "Ver exemplo", action: "experience" });
  }
  if (experience && !hasActionVerb(expText)) {
    suggestions.push({ id: "missing-verbs", priority: "média", area: "rh", title: "Use verbos de ação", description: "Comece descrições com ações reais como atendi, organizei, desenvolvi, vendi, coordenei ou analisei.", actionLabel: "Ver exemplo", action: "experience" });
  }
  if ((resume.strengths ?? []).length < 4) {
    suggestions.push({ id: "few-skills", priority: "média", area: "conteúdo", title: "Poucas habilidades listadas", description: "Use o resultado de aptidão e suas experiências para destacar habilidades técnicas e comportamentais reais.", actionLabel: "Ver habilidades", action: "skills" });
  }
  if (visualConfig.fontSize < 9 || visualConfig.fontSize > 12) {
    suggestions.push({ id: "font-size", priority: "baixa", area: "visual", title: "Ajuste o tamanho da fonte", description: "Fontes muito pequenas prejudicam leitura; fontes grandes demais aumentam páginas.", actionLabel: "Ajustar visual", action: "visual" });
  }
  if (contrastRisk(visualConfig)) {
    suggestions.push({ id: "contrast", priority: "baixa", area: "visual", title: "Contraste pode estar ruim", description: "Use texto escuro em fundo claro e cores de destaque moderadas.", actionLabel: "Ajustar cores", action: "visual" });
  }
  if (visualConfig.showPhoto && template.atsCompatible) {
    suggestions.push({ id: "photo-ats", priority: "baixa", area: "ats", title: "Foto pode reduzir segurança no ATS", description: "Foto é opcional. Para candidatura automática, a versão sem foto costuma ser mais segura.", actionLabel: "Ocultar foto", action: "photo" });
  }

  return suggestions;
}

export function scoreResume(input: {
  resume: ResumeData;
  templateId?: string | null;
  visualConfig: ResumeVisualConfig;
  sectionConfig?: ResumeSectionConfig;
  targetArea?: string | null;
  targetRole?: string | null;
  useForAutoApply?: boolean;
}): ResumeScores {
  const template = getResumeTemplate(input.templateId);
  const sectionConfig = input.sectionConfig ?? defaultSectionConfig;
  const resume = input.resume;
  const hasContact = isFilled(resume.phone);
  const hasSummary = wordCount(resume.summary) >= 20;
  const hasExp = hasMeaningfulExperience(resume);
  const completeExp = hasCompleteExperience(resume);
  const hasEdu = hasEducation(resume);
  const skills = (resume.strengths ?? []).filter(Boolean).length;
  const hiddenImportant = ["personal", "summary", "experience", "education"].some((key) => sectionConfig.visibility[key as keyof typeof sectionConfig.visibility] === false);
  const expText = resume.experiences.map((exp) => `${exp.role} ${exp.company} ${exp.description}`).join(" ");
  const totalWords = wordCount([resume.summary, expText].join(" "));

  let ats = template.baseAtsScore;
  if (!template.atsCompatible) ats -= 18;
  if (template.twoColumns) ats -= 6;
  if (input.visualConfig.showPhoto) ats -= input.useForAutoApply ? 10 : 4;
  if (input.visualConfig.hasOwnProperty("showIcons") && input.visualConfig.showIcons) ats -= 5;
  if (input.visualConfig.headerBackground) ats -= 3;
  if (!hasContact) ats -= 12;
  if (!hasSummary) ats -= 8;
  if (!hasExp) ats -= 12;
  if (!hasEdu) ats -= 8;
  if (skills < 4) ats -= 6;
  if (hiddenImportant) ats -= 10;
  if (contrastRisk(input.visualConfig)) ats -= 6;

  let rh = template.baseRhScore;
  if (!hasSummary) rh -= 12;
  if (!completeExp) rh -= hasExp ? 6 : 14;
  if (!hasEdu) rh -= 8;
  if (!hasActionVerb(expText)) rh -= 6;
  if (!hasNumber(expText) && hasExp) rh -= 5;
  if (totalWords > 900) rh -= 8;
  if (input.visualConfig.titleSize < 18 || input.visualConfig.titleSize > 34) rh -= 4;

  let visual = template.baseVisualScore;
  if (input.visualConfig.fontSize < 9 || input.visualConfig.fontSize > 12) visual -= 10;
  if (input.visualConfig.sectionSpacing < 8 || input.visualConfig.sectionSpacing > 28) visual -= 6;
  if (contrastRisk(input.visualConfig)) visual -= 12;
  if (input.visualConfig.showPhoto && !resume.photo) visual -= 4;
  if (input.visualConfig.density === "compacto" && totalWords > 700) visual -= 6;
  if (input.visualConfig.density === "espaçado" && totalWords < 250) visual -= 4;

  const content = clamp(40 + (hasSummary ? 15 : 0) + (completeExp ? 20 : hasExp ? 10 : 0) + (hasEdu ? 12 : 0) + Math.min(13, skills * 2) + (hasNumber(expText) ? 8 : 0) + (hasActionVerb(expText) ? 7 : 0));
  const completeness = clamp(35 + (hasContact ? 15 : 0) + (hasSummary ? 15 : 0) + (hasExp ? 15 : 0) + (hasEdu ? 12 : 0) + Math.min(8, skills));
  const areaFit = clamp(70 + ((resume.topProfileNames ?? []).some((profile) => input.targetArea?.toLowerCase().includes(profile.toLowerCase())) ? 12 : 0) + (input.targetRole && resume.title.toLowerCase().includes(input.targetRole.toLowerCase()) ? 10 : 0) - (skills < 3 ? 8 : 0));
  const clarity = clamp(82 + (hasSummary ? 5 : -8) + (totalWords > 900 ? -10 : 0) + (hiddenImportant ? -10 : 0));
  const objectivity = clamp(84 + (totalWords > 800 ? -14 : 0) + (wordCount(resume.summary) > 90 ? -8 : 0) + (input.visualConfig.density === "compacto" ? 4 : 0));
  const suggestions = buildResumeSuggestions({ resume, template, visualConfig: input.visualConfig, sectionConfig, useForAutoApply: input.useForAutoApply, targetArea: input.targetArea });
  const warnings = suggestions.filter((s) => s.priority === "alta").map((s) => s.title);
  const general = clamp(clamp(ats) * 0.24 + clamp(rh) * 0.2 + clamp(visual) * 0.14 + content * 0.16 + completeness * 0.12 + areaFit * 0.06 + clarity * 0.05 + objectivity * 0.03);
  const risk = clamp(ats) >= 88 ? "baixo" : clamp(ats) >= 76 ? "baixo/médio" : clamp(ats) >= 60 ? "médio" : "alto";

  return {
    general,
    ats: clamp(ats),
    rh: clamp(rh),
    visual: clamp(visual),
    content,
    completeness,
    areaFit,
    clarity,
    objectivity,
    risk,
    suggestions,
    warnings
  };
}
