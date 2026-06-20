import { prisma } from "../prisma";
import { getUser } from "../auth";
import { sourceInfo } from "./sources";
import { applyViaATS, type ATSResume } from "./ats";
import { getGreenhouseJobQuestions, summarizeRequiredGreenhouseQuestions } from "./ats/greenhouse-preflight";
import type { ApplicationStatus, QueueProgress } from "./types";

// Acessa o "currículo salvo no perfil" = Resultado de aptidão mais recente
// (dados já existentes no projeto) + dados de contato do JobProfile.
// NÃO cria novo gerador de currículo. Usa apenas dados já existentes.
export async function getResumeContext() {
  const user = await getUser();
  if (!user) return null;

  const sessions = await prisma.userSession.findMany({
    where: { userId: user.id, result: { isNot: null } },
    include: { result: true },
    orderBy: { createdAt: "desc" },
    take: 1
  });

  const latest = sessions[0]?.result;
  if (!latest) {
    return { user, hasResult: false as const, jobProfile: null };
  }

  const topProfiles = (Array.isArray(latest.topProfiles) ? latest.topProfiles : []) as {
    name?: string;
    slug?: string;
    strengths?: string[];
    searchKeywords?: string[];
  }[];
  const scores = (latest.scores as { detectedStrengths?: string[] }) ?? {};
  const strengths = Array.from(
    new Set([
      ...(Array.isArray(scores.detectedStrengths) ? scores.detectedStrengths : []),
      ...topProfiles.flatMap((p) => p.strengths ?? [])
    ])
  ).slice(0, 10);
  const topProfileNames = topProfiles.map((p) => p.name).filter(Boolean) as string[];
  const keywords = Array.from(new Set(topProfiles.flatMap((p) => p.searchKeywords ?? []))).slice(0, 12);

  const jobProfile = await prisma.jobProfile.findUnique({ where: { userId: user.id } });
  const resume = await prisma.resume.findUnique({ where: { userId: user.id } });

  return {
    user,
    hasResult: true as const,
    resultId: latest.id,
    topProfileNames,
    strengths,
    keywords,
    jobProfile,
    resume
  };
}

// Cria/atualiza o snapshot do currículo usado nas candidaturas a partir do
// Resultado mais recente. Não altera o fluxo de currículo existente.
export async function ensureJobProfile(): Promise<{
  ok: boolean;
  reason?: string;
  jobProfileId?: string;
}> {
  const ctx = await getResumeContext();
  if (!ctx) return { ok: false, reason: "Sessão expirada." };
  if (!ctx.hasResult) {
    return {
      ok: false,
      reason: "Você ainda não tem um resultado de aptidão salvo. Faça o teste e gere seu currículo antes de se candidatar."
    };
  }

  const existing = await prisma.jobProfile.findUnique({ where: { userId: ctx.user.id } });
  if (existing) {
    // Atualiza snapshot de aptidão mantendo dados de contato já preenchidos.
    const updated = await prisma.jobProfile.update({
      where: { id: existing.id },
      data: {
        resultId: ctx.resultId,
        topProfileNames: ctx.topProfileNames,
        strengths: ctx.strengths,
        keywords: ctx.keywords
      }
    });
    return { ok: true, jobProfileId: updated.id };
  }

  const created = await prisma.jobProfile.create({
    data: {
      userId: ctx.user.id,
      resultId: ctx.resultId,
      topProfileNames: ctx.topProfileNames,
      strengths: ctx.strengths,
      keywords: ctx.keywords
    }
  });
  return { ok: true, jobProfileId: created.id };
}

// Processa um item da fila de candidatura.
// Camada 1: fonte "auto" → candidatura real via API pública ATS (Greenhouse/Lever).
// Camada 2: fonte "needs_login" → bloqueado_login (UI mostra copiar + abrir).
// Camada 3: fonte "link_only" → ação_manual.
export async function processApplication(applicationId: string): Promise<ApplicationStatus> {
  const app = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    include: { job: true }
  });
  if (!app || !app.job) return "falhou";

  await prisma.jobApplication.update({
    where: { id: applicationId },
    data: { status: "em_andamento", attemptedAt: new Date() }
  });

  const info = sourceInfo(app.job.source);
  const support = info.autoSupport;

  try {
    if (support === "auto") {
      const result = await attemptAutoApply(app.job, app.resumeSnapshot);
      const status: ApplicationStatus = result.success ? "publicado" : "falhou";
      await prisma.jobApplication.update({
        where: { id: applicationId },
        data: {
          status,
          completedAt: new Date(),
          errorMessage: result.error,
          sourceCompat: support
        }
      });
      return status;
    }

    // Fontes link_only / needs_login / has_captcha / blocks_automation → manual/login.
    // Se a vaga tem applyEmail, marca acao_manual com mensagem sobre e-mail.
    let status: ApplicationStatus =
      support === "needs_login"
        ? "bloqueado_login"
        : support === "has_captcha"
          ? "bloqueado_captcha"
          : support === "blocks_automation" || support === "requires_employer_auth"
            ? "bloqueado_politica"
            : "acao_manual";

    let errorMsg = `${info.label}: ${info.note}`;
    if (support === "requires_employer_auth") {
      status = "acao_manual";
      let requiredMessage = "";
      if (app.job.source === "greenhouse" && app.job.atsBoard && app.job.atsJobId) {
        const questions = await getGreenhouseJobQuestions(app.job.atsBoard, app.job.atsJobId);
        const summary = summarizeRequiredGreenhouseQuestions(questions);
        requiredMessage = ` ${summary.message}`;
      }
      errorMsg = `${info.label}: o envio automático exige chave privada da empresa.${requiredMessage} Abra a vaga, copie o pacote de candidatura e preencha os campos obrigatórios.`;
    }
    if (app.job.applyEmail && (status === "acao_manual" || status === "bloqueado_login")) {
      status = "acao_manual";
      errorMsg = `Esta vaga aceita candidatura por e-mail: ${app.job.applyEmail}. Use o botão "Enviar por e-mail".`;
    }

    await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status,
        completedAt: new Date(),
        sourceCompat: support,
        errorMessage: errorMsg
      }
    });
    return status;
  } catch (error) {
    await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: "falhou",
        completedAt: new Date(),
        errorMessage: String(error),
        sourceCompat: support
      }
    });
    return "falhou";
  }
}

// Candidatura automática real via API pública ATS.
// Despacha para Greenhouse/Lever conforme a fonte da vaga.
// Sem credencial armazenada — dados enviados diretamente ao sistema da empresa.
async function attemptAutoApply(
  job: { source: string; atsBoard?: string | null; atsJobId?: string | null; originalUrl: string },
  resumeSnapshot: unknown
): Promise<{ success: boolean; error?: string }> {
  const snapshot = (resumeSnapshot ?? {}) as {
    name?: { name?: string; email?: string };
    jobProfile?: { phone?: string; summary?: string };
    resume?: {
      title?: string;
      phone?: string;
      linkedin?: string;
      summary?: string;
      experiences?: Array<{ company: string; role: string; period: string; description: string }>;
      education?: Array<{ institution: string; course: string; period: string }>;
      uploadedText?: string;
      activeResumeType?: string;
    };
    topProfileNames?: string[];
    strengths?: string[];
  };

  const name = snapshot.name?.name ?? "";
  const email = snapshot.name?.email ?? "";
  if (!name || !email) {
    return { success: false, error: "Nome e e-mail do usuário são obrigatórios para candidatura automática." };
  }

  const r = snapshot.resume;
  const useUploaded = r?.activeResumeType === "uploaded" && Boolean(r?.uploadedText);

  const summaryParts: string[] = [];
  if (useUploaded && r?.uploadedText) {
    summaryParts.push(r.uploadedText);
  } else {
    if (r?.summary) summaryParts.push(r.summary);
    if (r?.experiences?.length) {
      summaryParts.push("\nExperiência Profissional:");
      for (const exp of r.experiences) {
        if (exp.role || exp.company) {
          summaryParts.push(`- ${exp.role} | ${exp.company} (${exp.period})`);
          if (exp.description) summaryParts.push(`  ${exp.description}`);
        }
      }
    }
    if (r?.education?.length) {
      summaryParts.push("\nFormação Acadêmica:");
      for (const edu of r.education) {
        if (edu.course || edu.institution) {
          summaryParts.push(`- ${edu.course} | ${edu.institution} (${edu.period})`);
        }
      }
    }
    if ((snapshot.topProfileNames ?? []).length > 0) {
      summaryParts.push(`\nPerfil de aptidão: ${(snapshot.topProfileNames ?? []).join(", ")}`);
    }
    if ((snapshot.strengths ?? []).length > 0) {
      summaryParts.push(`Forças: ${(snapshot.strengths ?? []).join(", ")}`);
    }
    if (r?.linkedin) summaryParts.push(`LinkedIn: ${r.linkedin}`);
  }

  const resume: ATSResume = {
    name,
    email,
    phone: r?.phone ?? snapshot.jobProfile?.phone ?? undefined,
    summary: summaryParts.join("\n").slice(0, 8000),
    strengths: snapshot.strengths ?? [],
    topProfileNames: snapshot.topProfileNames ?? []
  };

  return applyViaATS(job.source, job.atsBoard ?? null, job.atsJobId ?? null, resume);
}

export function queueProgress(apps: { status: string }[]): QueueProgress {
  const count = (s: string) => apps.filter((a) => a.status === s).length;
  return {
    total: apps.length,
    publicados: count("publicado"),
    falharam: count("falhou") + count("site_indisponivel") + count("vaga_expirada") + count("formulario_nao_reconhecido"),
    acaoManual: count("acao_manual") + count("bloqueado_captcha") + count("bloqueado_login") + count("bloqueado_politica"),
    aguardando: count("aguardando"),
    emAndamento: count("em_andamento")
  };
}
