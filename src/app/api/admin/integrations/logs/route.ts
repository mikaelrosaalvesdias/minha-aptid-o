import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const { searchParams } = new URL(request.url);
    const providerSlug = searchParams.get("providerSlug");
    const logs = await prisma.integrationLog.findMany({
      where: providerSlug ? { providerSlug } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100
    });
    return NextResponse.json({ logs });
  } catch (error) {
    await logError("Falha ao carregar logs de integração", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível carregar logs." }, { status: 500 });
  }
}
