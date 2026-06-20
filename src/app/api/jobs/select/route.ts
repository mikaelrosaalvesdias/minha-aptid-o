import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

const selectSchema = z.object({
  jobIds: z.array(z.string().min(1)).min(1).max(1000),
  selected: z.boolean()
});

export async function POST(request: Request) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  try {
    const parsed = selectSchema.parse(await request.json());
    const result = await prisma.job.updateMany({
      where: { id: { in: parsed.jobIds }, userId },
      data: { selected: parsed.selected }
    });
    return NextResponse.json({ updated: result.count });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos.", issues: error.issues }, { status: 400 });
    }
    await logError("Falha na seleção em massa", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível selecionar as vagas." }, { status: 500 });
  }
}
