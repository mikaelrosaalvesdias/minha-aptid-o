import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";
import { processApplication } from "@/lib/jobs/apply";

export const dynamic = "force-dynamic";

// Reprocessar uma candidatura individual (retry)
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  const { id } = await params;
  try {
    const app = await prisma.jobApplication.findFirst({ where: { id, userId } });
    if (!app) return NextResponse.json({ error: "Candidatura não encontrada." }, { status: 404 });

    const status = await processApplication(id);
    const updated = await prisma.jobApplication.findUnique({ where: { id }, include: { job: true } });
    return NextResponse.json({ application: updated, status });
  } catch (error) {
    await logError("Falha ao reprocessar candidatura", { id, error: String(error) });
    return NextResponse.json({ error: "Não foi possível reprocessar." }, { status: 500 });
  }
}
