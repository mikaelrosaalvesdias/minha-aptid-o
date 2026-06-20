import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const result = await prisma.result.findUnique({
      where: { id },
      select: { sessionId: true }
    });

    if (!result) {
      return NextResponse.json({ ok: true });
    }

    await prisma.userSession.delete({
      where: { id: result.sessionId }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    await logError("Falha ao apagar resultado", { resultId: id, error: String(error) });
    return NextResponse.json({ error: "Não foi possível apagar este resultado." }, { status: 500 });
  }
}
