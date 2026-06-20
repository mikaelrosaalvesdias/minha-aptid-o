import type { ResumeData, ResumeSectionConfig } from "./types";
import { defaultSectionConfig } from "./templates";

function filled(value?: string | null) {
  return Boolean(value && value.trim());
}

export function resumeToPlainText(input: {
  userName: string;
  userEmail: string;
  resume: ResumeData;
  sectionConfig?: ResumeSectionConfig;
  ats?: boolean;
}) {
  const { userName, userEmail, resume } = input;
  const config = input.sectionConfig ?? defaultSectionConfig;
  const visible = config.visibility;
  const titles = config.titles;
  const lines: string[] = [];

  if (visible.personal) {
    lines.push(userName.toUpperCase());
    if (filled(resume.title)) lines.push(resume.title);
    lines.push(userEmail);
    if (filled(resume.phone)) lines.push(resume.phone!);
    if (filled(resume.linkedin)) lines.push(resume.linkedin!);
    lines.push("");
  }

  for (const section of config.order) {
    if (!visible[section] || section === "personal") continue;
    if (section === "summary" && filled(resume.summary)) {
      lines.push((titles.summary ?? "Resumo profissional").toUpperCase(), resume.summary!, "");
    }
    if (section === "experience" && resume.experiences.some((exp) => exp.role || exp.company)) {
      lines.push((titles.experience ?? "Experiência profissional").toUpperCase());
      for (const exp of resume.experiences.filter((item) => item.role || item.company || item.description)) {
        lines.push([exp.role, exp.company].filter(Boolean).join(" — "));
        if (exp.period) lines.push(exp.period);
        if (exp.description) lines.push(exp.description);
        lines.push("");
      }
    }
    if (section === "education" && resume.education.some((edu) => edu.course || edu.institution)) {
      lines.push((titles.education ?? "Formação acadêmica").toUpperCase());
      for (const edu of resume.education.filter((item) => item.course || item.institution)) {
        lines.push([edu.course, edu.institution].filter(Boolean).join(" — "));
        if (edu.period) lines.push(edu.period);
        lines.push("");
      }
    }
    if (section === "softSkills" && (resume.strengths ?? []).length > 0) {
      lines.push((titles.softSkills ?? "Habilidades comportamentais").toUpperCase(), (resume.strengths ?? []).join(", "), "");
    }
    if (section === "technicalSkills" && (resume.topProfileNames ?? []).length > 0) {
      lines.push((titles.technicalSkills ?? "Áreas de aptidão").toUpperCase(), (resume.topProfileNames ?? []).join(", "), "");
    }
  }

  if (input.ats) {
    lines.push("Aviso: versão otimizada para sistemas de recrutamento, com estrutura simples e texto selecionável.");
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function resumeToStructuredApplication(input: {
  userName: string;
  userEmail: string;
  resume: ResumeData;
  sectionConfig?: ResumeSectionConfig;
}) {
  return {
    name: input.userName,
    email: input.userEmail,
    phone: input.resume.phone ?? undefined,
    linkedin: input.resume.linkedin ?? undefined,
    title: input.resume.title,
    summary: input.resume.summary ?? undefined,
    experiences: input.resume.experiences.filter((exp) => exp.role || exp.company || exp.description),
    education: input.resume.education.filter((edu) => edu.course || edu.institution),
    strengths: input.resume.strengths ?? [],
    topProfileNames: input.resume.topProfileNames ?? [],
    plainText: resumeToPlainText(input)
  };
}
