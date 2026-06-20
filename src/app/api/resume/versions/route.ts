import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";
import { defaultSectionConfig, getResumeTemplate } from "@/lib/resume/templates";
import { scoreResume } from "@/lib/resume/scoring";

export const dynamic = "force-dynamic";

const versionSchema = z.object({
  name: z.string().trim().min(1).max(120),
  kind: z.string().trim().max(40).default("visual"),
  templateId: z.string().trim().min(1).max(80),
  targetArea: z.string().trim().max(120).optional().nullable(),
  targetRole: z.string().trim().max(120).optional().nullable(),
  visualConfig: z.record(z.unknown()).default({}),
  sectionConfig: z.record(z.unknown()).default({}),
  guideAnswers: z.record(z.unknown()).default({}),
  isPrincipal: z.boolean().default(false),
  useForAutoApply: z.boolean().default(false),
  useForManualApply: z.boolean().default(false),
  useForAreas: z.array(z.string().max(80)).max(20).default([])
});

function asArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

async function getResumeForScore(userId: string) {
  const resume = await prisma.resume.findUnique({ where: { userId } });
  if (!resume) return null;
  return {
    id: resume.id,
    title: resume.title,
    phone: resume.phone,
    linkedin: resume.linkedin,
    summary: resume.summary,
    photo: resume.photo,
    experiences: resume.experiences as Array<{ company: string; role: string; period: string; description: string }>,
    education: resume.education as Array<{ institution: string; course: string; period: string }>,
    topProfileNames: asArray(resume.topProfileNames),
    strengths: asArray(resume.strengths),
    uploadedText: resume.uploadedText,
    activeResumeType: resume.activeResumeType
  };
}

export async function GET() {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  try {
    const versions = await prisma.resumeVersion.findMany({
      where: { userId },
      orderBy: [{ isPrincipal: "desc" }, { updatedAt: "desc" }]
    });
    return NextResponse.json({ versions });
  } catch (error) {
    await logError("Falha ao carregar versões de currículo", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível carregar as versões." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  try {
    const parsed = versionSchema.parse(await request.json());
    const template = getResumeTemplate(parsed.templateId);
    const resume = await getResumeForScore(userId);
    if (!resume) return NextResponse.json({ error: "Salve o currículo principal antes de criar versões." }, { status: 400 });

    const visualConfig = { ...template.defaultVisualConfig, ...parsed.visualConfig };
    const sectionConfig = { ...defaultSectionConfig, ...parsed.sectionConfig };
    const scores = scoreResume({
      resume,
      templateId: template.id,
      visualConfig,
      sectionConfig,
      targetArea: parsed.targetArea,
      targetRole: parsed.targetRole,
      useForAutoApply: parsed.useForAutoApply
    });

    if (parsed.isPrincipal) {
      await prisma.resumeVersion.updateMany({ where: { userId, isPrincipal: true }, data: { isPrincipal: false } });
    }

    const version = await prisma.resumeVersion.create({
      data: {
        userId,
        resumeId: resume.id,
        name: parsed.name,
        kind: parsed.kind,
        templateId: template.id,
        targetArea: parsed.targetArea,
        targetRole: parsed.targetRole,
        visualConfig: visualConfig as Prisma.InputJsonValue,
        sectionConfig: sectionConfig as Prisma.InputJsonValue,
        guideAnswers: parsed.guideAnswers as Prisma.InputJsonValue,
        scores: scores as unknown as Prisma.InputJsonValue,
        suggestions: scores.suggestions as unknown as Prisma.InputJsonValue,
        isPrincipal: parsed.isPrincipal,
        useForAutoApply: parsed.useForAutoApply,
        useForManualApply: parsed.useForManualApply,
        useForAreas: parsed.useForAreas as Prisma.InputJsonValue
      }
    });

    return NextResponse.json({ version });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos.", issues: error.issues }, { status: 400 });
    }
    await logError("Falha ao criar versão de currículo", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível criar a versão." }, { status: 500 });
  }
}
