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
    const version = await prisma.resumeVersion.findFirst({ where: { id, userId } });
    if (!version) return NextResponse.json({ error: "Versão não encontrada." }, { status: 404 });
    await prisma.resumeVersion.updateMany({ where: { userId, isPrincipal: true }, data: { isPrincipal: false } });
    const updated = await prisma.resumeVersion.update({
      where: { id },
      data: { isPrincipal: true, useForAutoApply: version.useForAutoApply || version.kind === "ats", useForManualApply: true }
    });
    return NextResponse.json({ version: updated });
  } catch (error) {
    await logError("Falha ao definir currículo principal", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível definir como principal." }, { status: 500 });
  }
}
