import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  try {
    const applications = await prisma.externalJobApplication.findMany({
      where: { userId: user.id },
      include: { externalJob: { select: { id: true, title: true, companyName: true, applicationUrl: true, sourceUrl: true } }, resumeVersion: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ applications });
  } catch (error) {
    await logError("Falha ao listar candidaturas externas", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível carregar candidaturas." }, { status: 500 });
  }
}
