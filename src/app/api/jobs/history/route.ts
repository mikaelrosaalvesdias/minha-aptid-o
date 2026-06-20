import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

// Histórico de buscas realizadas
export async function GET() {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  try {
    const searches = await prisma.jobSearchHistory.findMany({
      where: { userId },
      orderBy: { searchedAt: "desc" },
      take: 100
    });
    return NextResponse.json({ searches });
  } catch (error) {
    await logError("Falha ao carregar histórico de buscas", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível carregar o histórico." }, { status: 500 });
  }
}
