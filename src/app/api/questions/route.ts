import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        text: true,
        category: true,
        type: true,
        options: true,
        order: true
      }
    });

    return NextResponse.json({ questions });
  } catch (error) {
    await logError("Falha ao carregar perguntas", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível carregar as perguntas." }, { status: 500 });
  }
}
