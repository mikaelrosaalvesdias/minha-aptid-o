import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tests = await prisma.capacityTest.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      include: {
        questions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            text: true,
            options: true,
            explanation: true
          }
        }
      }
    });

    return NextResponse.json({ tests });
  } catch (error) {
    await logError("Falha ao carregar testes práticos", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível carregar os testes práticos." }, { status: 500 });
  }
}
