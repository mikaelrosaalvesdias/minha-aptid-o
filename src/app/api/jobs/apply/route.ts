import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";
import { ensureJobProfile, processApplication, queueProgress } from "@/lib/jobs/apply";

export const dynamic = "force-dynamic";

const applySchema = z.object({
  jobIds: z.array(z.string().min(1)).min(1).max(500),
  consent: z.literal(true)
});

// Cria consentimento + fila de candidatura e processa cada item.
export async function POST(request: Request) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  try {
    const parsed = applySchema.parse(await request.json());
    const ensured = await ensureJobProfile();
    if (!ensured.ok) {
      return NextResponse.json({ error: ensured.reason }, { status: 400 });
    }

    const jobs = await prisma.job.findMany({
      where: { id: { in: parsed.jobIds }, userId }
    });
    if (jobs.length === 0) {
      return NextResponse.json({ error: "Nenhuma vaga válida selecionada." }, { status: 400 });
    }

    const jobProfile = await prisma.jobProfile.findUnique({ where: { userId } });
    const resume = await prisma.resume.findUnique({ where: { userId } });
    const principalVersion = await prisma.resumeVersion.findFirst({
      where: {
        userId,
        OR: [{ isPrincipal: true }, { useForAutoApply: true }]
      },
      orderBy: [{ isPrincipal: "desc" }, { useForAutoApply: "desc" }, { updatedAt: "desc" }]
    });
    const resumeRef = principalVersion ? `ResumeVersion:${principalVersion.id}` : jobProfile ? `JobProfile:${jobProfile.id}` : "Result:sem-perfil-cadastrado";
    const resumeSnapshot = {
      name: (await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }))!,
      jobProfile,
      resume: resume
        ? {
            title: resume.title,
            phone: resume.phone,
            linkedin: resume.linkedin,
            summary: resume.summary,
            experiences: resume.experiences as Array<{ company: string; role: string; period: string; description: string }>,
            education: resume.education as Array<{ institution: string; course: string; period: string }>,
            uploadedText: resume.uploadedText,
            activeResumeType: resume.activeResumeType
          }
        : null,
      resumeVersion: principalVersion
        ? {
            id: principalVersion.id,
            name: principalVersion.name,
            kind: principalVersion.kind,
            templateId: principalVersion.templateId,
            sectionConfig: principalVersion.sectionConfig,
            visualConfig: principalVersion.visualConfig,
            isPrincipal: principalVersion.isPrincipal,
            useForAutoApply: principalVersion.useForAutoApply,
            useForManualApply: principalVersion.useForManualApply
          }
        : null,
      topProfileNames: (jobProfile?.topProfileNames as string[]) ?? [],
      strengths: (jobProfile?.strengths as string[]) ?? [],
      keywords: (jobProfile?.keywords as string[]) ?? []
    };

    // 1) Consentimento
    const consent = await prisma.jobConsent.create({
      data: {
        userId,
        jobCount: jobs.length,
        resumeUsed: resumeRef,
        status: "confirmado",
        jobIds: jobs.map((j) => j.id),
        jobProfileId: jobProfile?.id ?? null
      }
    });

    // 2) Fila de candidatura
    const applications = [];
    for (const job of jobs) {
      const existing = await prisma.jobApplication.findUnique({
        where: { userId_jobId: { userId, jobId: job.id } }
      });
      if (existing) {
        // Reset para reprocessar se for retry
        await prisma.jobApplication.update({
          where: { id: existing.id },
          data: { status: "aguardando", consentId: consent.id, errorMessage: null, attemptedAt: null, completedAt: null }
        });
        applications.push(existing.id);
        continue;
      }
      const app = await prisma.jobApplication.create({
        data: {
          userId,
          jobId: job.id,
          consentId: consent.id,
          status: "aguardando",
          resumeSnapshot,
          jobProfileId: jobProfile?.id ?? null
        }
      });
      applications.push(app.id);
    }

    // 3) Processa a fila (best-effort, sequencial e rápido).
    //    Cada item decide auto vs manual conforme a fonte.
    for (const appId of applications) {
      await processApplication(appId);
    }

    const all = await prisma.jobApplication.findMany({
      where: { id: { in: applications } },
      select: { status: true }
    });
    const progress = queueProgress(all);

    return NextResponse.json({ consentId: consent.id, applications: applications, progress });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Confirmação de consentimento é obrigatória.", issues: error.issues },
        { status: 400 }
      );
    }
    await logError("Falha na publicação em lote", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível iniciar a publicação." }, { status: 500 });
  }
}
