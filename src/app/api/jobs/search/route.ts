import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";
import { runJobSearchForUser } from "@/lib/jobs/cron";

export const dynamic = "force-dynamic";

export async function POST() {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  try {
    const pref = await prisma.jobPreference.findUnique({ where: { userId } });
    if (!pref) {
      return NextResponse.json(
        { error: "Configure suas preferências de busca antes de buscar vagas." },
        { status: 400 }
      );
    }

    const result = await runJobSearchForUser(userId);

    return NextResponse.json(result);
  } catch (error) {
    await logError("Falha na busca de vagas", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível buscar vagas agora." }, { status: 500 });
  }
}
