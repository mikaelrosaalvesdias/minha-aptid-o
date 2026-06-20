import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";
import { queueProgress } from "@/lib/jobs/apply";

export const dynamic = "force-dynamic";

// Histórico/progresso da fila de candidaturas
export async function GET(request: Request) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status")?.trim();

    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;

    const applications = await prisma.jobApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 500,
      include: { job: true, consent: true }
    });

    const allForProgress = await prisma.jobApplication.findMany({
      where: { userId },
      select: { status: true }
    });

    return NextResponse.json({
      applications,
      progress: queueProgress(allForProgress)
    });
  } catch (error) {
    await logError("Falha ao carregar candidaturas", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível carregar o histórico." }, { status: 500 });
  }
}
