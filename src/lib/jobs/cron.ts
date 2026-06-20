import { prisma } from "../prisma";
import { logError } from "../logging";
import { searchJobs, scoreAndStamp } from "./search";
import { getResumeContext } from "./apply";
import { extractApplyEmail } from "./extract";
import type { JobPreferenceInput } from "./types";

// Função reutilizável: executa busca de vagas para um usuário.
// Usada pela rota /api/jobs/search (manual) e pela rota /api/jobs/cron (automática).
// Não depende de cookies/auth — recebe userId diretamente.
export async function runJobSearchForUser(userId: string): Promise<{
  found: number;
  new: number;
  sources: string[];
  notificationId: string | null;
}> {
  const pref = await prisma.jobPreference.findUnique({ where: { userId } });
  if (!pref) {
    return { found: 0, new: 0, sources: [], notificationId: null };
  }

  const ctx = await getResumeContextForUser(userId);
  const topProfileNames = ctx?.hasResult ? ctx.topProfileNames : [];
  const strengths = ctx?.hasResult ? ctx.strengths : [];
  const keywords = ctx?.hasResult ? ctx.keywords : (pref.keywordsDesejadas as string[]);

  const prefInput: JobPreferenceInput = {
    cargo: pref.cargo,
    area: pref.area,
    cidade: pref.cidade,
    estado: pref.estado,
    modelo: pref.modelo as JobPreferenceInput["modelo"],
    salarioMin: pref.salarioMin,
    salarioMax: pref.salarioMax,
    nivel: pref.nivel as JobPreferenceInput["nivel"],
    contrato: pref.contrato as JobPreferenceInput["contrato"],
    keywordsDesejadas: pref.keywordsDesejadas as string[],
    keywordsEvitar: pref.keywordsEvitar as string[],
    aceitaSemSalario: pref.aceitaSemSalario,
    aceitaForaCidade: pref.aceitaForaCidade,
    frequenciaBusca: pref.frequenciaBusca as JobPreferenceInput["frequenciaBusca"],
    recebeNotificacoes: pref.recebeNotificacoes
  };

  const { raw, sources, atsMeta } = await searchJobs(prefInput);
  const scored = scoreAndStamp(
    raw,
    { topProfileNames, strengths, keywords, preference: prefInput },
    atsMeta
  );

  let newCount = 0;
  const createdIds: string[] = [];

  for (const job of scored) {
    try {
      const applyEmail = extractApplyEmail(job.description);
      const created = await prisma.job.create({
        data: {
          userId,
          preferenceId: pref.id,
          title: job.title,
          company: job.company,
          city: job.city,
          state: job.state,
          modelo: job.modelo,
          salario: job.salario,
          contrato: job.contrato,
          nivel: job.nivel,
          description: job.description,
          requisitos: job.requisitos ?? [],
          beneficios: job.beneficios ?? [],
          originalUrl: job.originalUrl,
          source: job.source,
          sourceAutoSupport: job.sourceAutoSupport,
          atsBoard: job.atsBoard ?? null,
          atsJobId: job.atsJobId ?? null,
          applyEmail: applyEmail ?? null,
          publishedAt: job.publishedAt ? new Date(job.publishedAt) : null,
          confidence: job.confidence ?? 0.5,
          dedupHash: job.dedupHash,
          compatibilityScore: job.compatibilityScore,
          compatibilityReason: job.compatibilityReason,
          compatibilityBlock: job.compatibilityBlock
        }
      });
      createdIds.push(created.id);
      newCount++;
    } catch {
      // dedupHash duplicado → vaga já existe
    }
  }

  await prisma.jobPreference.update({
    where: { userId },
    data: { ultimaBuscaEm: new Date() }
  });

  await prisma.jobSearchHistory.create({
    data: {
      userId,
      preferenceId: pref.id,
      source: sources.join(","),
      query: [pref.cargo, pref.area].filter(Boolean).join(" "),
      filters: {
        cidade: pref.cidade,
        estado: pref.estado,
        modelo: pref.modelo,
        nivel: pref.nivel,
        contrato: pref.contrato
      },
      foundCount: scored.length,
      newCount
    }
  });

  let notificationId: string | null = null;
  if (pref.recebeNotificacoes && createdIds.length > 0) {
    const topArea = topProfileNames[0] || pref.area || pref.cargo || "sua área";
    const notification = await prisma.jobNotification.create({
      data: {
        userId,
        preferenceId: pref.id,
        message: `${createdIds.length} nova(s) vaga(s) compatíveis encontradas para ${topArea}.`,
        areaCargo: topArea,
        jobCount: createdIds.length,
        jobIds: createdIds
      }
    });
    notificationId = notification.id;
    await prisma.job.updateMany({
      where: { id: { in: createdIds } },
      data: { notified: true }
    });
  }

  return { found: scored.length, new: newCount, sources, notificationId };
}

// Variante de getResumeContext que recebe userId em vez de ler cookies.
// Necessário para o cron que roda sem sessão de usuário.
async function getResumeContextForUser(userId: string) {
  const sessions = await prisma.userSession.findMany({
    where: { userId, result: { isNot: null } },
    include: { result: true },
    orderBy: { createdAt: "desc" },
    take: 1
  });

  const latest = sessions[0]?.result;
  if (!latest) {
    return { hasResult: false as const, topProfileNames: [], strengths: [], keywords: [] };
  }

  const topProfiles = (Array.isArray(latest.topProfiles) ? latest.topProfiles : []) as {
    name?: string;
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

  return {
    hasResult: true as const,
    topProfileNames,
    strengths,
    keywords
  };
}

// Lógica do cron: busca usuários que precisam de busca automática.
export async function runCronSearch(): Promise<{
  processed: number;
  errors: number;
  details: Array<{ userId: string; found: number; new: number }>;
}> {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Usuários com frequência diária: última busca há mais de 24h
  // Usuários com frequência semanal: última busca há mais de 7 dias
  const dailyPrefs = await prisma.jobPreference.findMany({
    where: {
      frequenciaBusca: "diaria",
      OR: [{ ultimaBuscaEm: null }, { ultimaBuscaEm: { lt: oneDayAgo } }]
    },
    select: { userId: true },
    take: 50
  });

  const weeklyPrefs = await prisma.jobPreference.findMany({
    where: {
      frequenciaBusca: "semanal",
      OR: [{ ultimaBuscaEm: null }, { ultimaBuscaEm: { lt: sevenDaysAgo } }]
    },
    select: { userId: true },
    take: 50
  });

  const userIds = Array.from(new Set([...dailyPrefs.map((p) => p.userId), ...weeklyPrefs.map((p) => p.userId)]));

  const details: Array<{ userId: string; found: number; new: number }> = [];
  let errors = 0;

  for (const userId of userIds) {
    try {
      const result = await runJobSearchForUser(userId);
      details.push({ userId, found: result.found, new: result.new });
    } catch (error) {
      errors++;
      await logError("Falha no cron de busca para usuário", { userId, error: String(error) });
    }
  }

  return { processed: userIds.length, errors, details };
}
