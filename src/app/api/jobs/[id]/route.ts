import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";
import { getGreenhouseJobQuestions, summarizeRequiredGreenhouseQuestions } from "@/lib/jobs/ats/greenhouse-preflight";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  const { id } = await params;
  try {
    const job = await prisma.job.findFirst({ where: { id, userId } });
    if (!job) return NextResponse.json({ error: "Vaga não encontrada." }, { status: 404 });

    if (!job.viewed) {
      await prisma.job.update({ where: { id }, data: { viewed: true } });
    }

    const application = await prisma.jobApplication.findUnique({
      where: { userId_jobId: { userId, jobId: id } }
    });

    const atsPreflight = job.source === "greenhouse" && job.atsBoard && job.atsJobId
      ? summarizeRequiredGreenhouseQuestions(await getGreenhouseJobQuestions(job.atsBoard, job.atsJobId))
      : null;

    return NextResponse.json({ job, application, atsPreflight });
  } catch (error) {
    await logError("Falha ao carregar vaga", { id, error: String(error) });
    return NextResponse.json({ error: "Não foi possível carregar a vaga." }, { status: 500 });
  }
}

// Selecionar/desselecionar vaga
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  const { id } = await params;
  try {
    const body = (await request.json()) as { selected?: boolean };
    const job = await prisma.job.findFirst({ where: { id, userId } });
    if (!job) return NextResponse.json({ error: "Vaga não encontrada." }, { status: 404 });

    const updated = await prisma.job.update({
      where: { id },
      data: { selected: body.selected ?? !job.selected }
    });

    return NextResponse.json({ job: updated });
  } catch (error) {
    await logError("Falha ao atualizar vaga", { id, error: String(error) });
    return NextResponse.json({ error: "Não foi possível atualizar a vaga." }, { status: 500 });
  }
}
