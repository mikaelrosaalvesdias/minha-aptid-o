import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { logError } from "@/lib/logging";
import { createIntegrationLog } from "@/lib/integrations/service";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  try {
    const { id: connectionId } = await params;
    const connection = await prisma.userExternalConnection.findFirst({ where: { id: connectionId, userId: user.id } });
    if (!connection) return NextResponse.json({ error: "Conexão não encontrada." }, { status: 404 });

    await prisma.userExternalConnection.delete({ where: { id: connectionId } });
    await createIntegrationLog({ userId: user.id, providerId: connection.providerId, providerSlug: connection.providerSlug, action: "user.disconnect", status: "success" });
    return NextResponse.json({ ok: true });
  } catch (error) {
    await logError("Falha ao remover conexão de integração", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível remover a conexão." }, { status: 500 });
  }
}
