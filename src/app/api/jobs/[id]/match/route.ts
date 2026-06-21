import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

const schema = z.object({
  matchScore: z.number().int().min(0).max(100).default(0),
  matchReason: z.string().optional(),
  missingSkills: z.array(z.string()).default([]),
  recommendedCourses: z.array(z.string()).default([]),
  recommendedResumeVersionId: z.string().nullable().optional(),
  status: z.enum(["suggested", "viewed", "approved", "rejected", "applied", "archived"]).default("suggested")
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  try {
    const { id } = await params;
    const job = await prisma.externalJob.findUnique({ where: { id } });
    if (!job) return NextResponse.json({ error: "Vaga externa não encontrada." }, { status: 404 });

    const payload = schema.parse(await request.json());
    const match = await prisma.jobMatch.upsert({
      where: { userId_externalJobId: { userId: user.id, externalJobId: id } },
      update: payload,
      create: { userId: user.id, externalJobId: id, ...payload }
    });
    return NextResponse.json({ match });
  } catch (error) {
    await logError("Falha ao salvar match de vaga externa", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível salvar compatibilidade." }, { status: 400 });
  }
}
