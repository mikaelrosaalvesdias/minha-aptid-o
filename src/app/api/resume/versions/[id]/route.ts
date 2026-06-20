import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";
import { getResumeTemplate } from "@/lib/resume/templates";
import { scoreResume } from "@/lib/resume/scoring";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  kind: z.string().trim().max(40).optional(),
  templateId: z.string().trim().min(1).max(80).optional(),
  targetArea: z.string().trim().max(120).optional().nullable(),
  targetRole: z.string().trim().max(120).optional().nullable(),
  visualConfig: z.record(z.unknown()).optional(),
  sectionConfig: z.record(z.unknown()).optional(),
  guideAnswers: z.record(z.unknown()).optional(),
  isPrincipal: z.boolean().optional(),
  useForAutoApply: z.boolean().optional(),
  useForManualApply: z.boolean().optional(),
  useForAreas: z.array(z.string().max(80)).max(20).optional()
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

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });
  const { id } = await params;

  try {
    const version = await prisma.resumeVersion.findFirst({ where: { id, userId } });
    if (!version) return NextResponse.json({ error: "Versão não encontrada." }, { status: 404 });
    return NextResponse.json({ version });
  } catch (error) {
    await logError("Falha ao carregar versão de currículo", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível carregar a versão." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });
  const { id } = await params;

  try {
    const current = await prisma.resumeVersion.findFirst({ where: { id, userId } });
    if (!current) return NextResponse.json({ error: "Versão não encontrada." }, { status: 404 });
    const parsed = patchSchema.parse(await request.json());
    const template = getResumeTemplate(parsed.templateId ?? current.templateId);
    const resume = await getResumeForScore(userId);
    if (!resume) return NextResponse.json({ error: "Currículo principal não encontrado." }, { status: 400 });

    const visualConfig = { ...(current.visualConfig as Record<string, unknown>), ...(parsed.visualConfig ?? {}) };
    const sectionConfig = { ...(current.sectionConfig as Record<string, unknown>), ...(parsed.sectionConfig ?? {}) };
    const useForAutoApply = parsed.useForAutoApply ?? current.useForAutoApply;
    const scores = scoreResume({
      resume,
      templateId: template.id,
      visualConfig: visualConfig as never,
      sectionConfig: sectionConfig as never,
      targetArea: parsed.targetArea ?? current.targetArea,
      targetRole: parsed.targetRole ?? current.targetRole,
      useForAutoApply
    });

    if (parsed.isPrincipal) {
      await prisma.resumeVersion.updateMany({ where: { userId, isPrincipal: true, id: { not: id } }, data: { isPrincipal: false } });
    }

    const version = await prisma.resumeVersion.update({
      where: { id },
      data: {
        ...(parsed.name !== undefined ? { name: parsed.name } : {}),
        ...(parsed.kind !== undefined ? { kind: parsed.kind } : {}),
        ...(parsed.targetArea !== undefined ? { targetArea: parsed.targetArea } : {}),
        ...(parsed.targetRole !== undefined ? { targetRole: parsed.targetRole } : {}),
        ...(parsed.guideAnswers !== undefined ? { guideAnswers: parsed.guideAnswers as Prisma.InputJsonValue } : {}),
        ...(parsed.isPrincipal !== undefined ? { isPrincipal: parsed.isPrincipal } : {}),
        ...(parsed.useForAutoApply !== undefined ? { useForAutoApply: parsed.useForAutoApply } : {}),
        ...(parsed.useForManualApply !== undefined ? { useForManualApply: parsed.useForManualApply } : {}),
        ...(parsed.useForAreas !== undefined ? { useForAreas: parsed.useForAreas as Prisma.InputJsonValue } : {}),
        templateId: template.id,
        visualConfig: visualConfig as Prisma.InputJsonValue,
        sectionConfig: sectionConfig as Prisma.InputJsonValue,
        scores: scores as unknown as Prisma.InputJsonValue,
        suggestions: scores.suggestions as unknown as Prisma.InputJsonValue
      }
    });

    return NextResponse.json({ version });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos.", issues: error.issues }, { status: 400 });
    }
    await logError("Falha ao atualizar versão de currículo", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível atualizar a versão." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });
  const { id } = await params;

  try {
    const version = await prisma.resumeVersion.findFirst({ where: { id, userId } });
    if (!version) return NextResponse.json({ error: "Versão não encontrada." }, { status: 404 });
    await prisma.resumeVersion.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    await logError("Falha ao excluir versão de currículo", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível excluir a versão." }, { status: 500 });
  }
}
