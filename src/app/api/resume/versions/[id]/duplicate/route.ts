import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });
  const { id } = await params;

  try {
    const current = await prisma.resumeVersion.findFirst({ where: { id, userId } });
    if (!current) return NextResponse.json({ error: "Versão não encontrada." }, { status: 404 });
    const version = await prisma.resumeVersion.create({
      data: {
        userId,
        resumeId: current.resumeId,
        name: `${current.name} (cópia)`,
        kind: current.kind,
        templateId: current.templateId,
        targetArea: current.targetArea,
        targetRole: current.targetRole,
        visualConfig: current.visualConfig ?? {},
        sectionConfig: current.sectionConfig ?? {},
        guideAnswers: current.guideAnswers ?? {},
        scores: current.scores ?? {},
        suggestions: current.suggestions ?? [],
        exportHistory: [],
        isPrincipal: false,
        useForAutoApply: current.useForAutoApply,
        useForManualApply: current.useForManualApply,
        useForAreas: current.useForAreas ?? []
      }
    });
    return NextResponse.json({ version });
  } catch (error) {
    await logError("Falha ao duplicar versão de currículo", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível duplicar a versão." }, { status: 500 });
  }
}
