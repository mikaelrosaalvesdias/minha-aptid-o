import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { logError } from "@/lib/logging";
import { getProvider } from "@/lib/integrations/providers/registry";
import { createIntegrationLog } from "@/lib/integrations/service";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  try {
    const { id: connectionId } = await params;
    const connection = await prisma.userExternalConnection.findFirst({
      where: { id: connectionId, userId: user.id },
      include: { provider: true }
    });
    if (!connection) return NextResponse.json({ error: "Conexão não encontrada." }, { status: 404 });

    const result = await getProvider(connection.provider.slug)?.syncProfile(connection, { provider: connection.provider, connection }) ?? { ok: false, message: "Sincronização não implementada." };
    await prisma.userExternalConnection.update({ where: { id: connectionId }, data: { lastSyncAt: result.ok ? new Date() : connection.lastSyncAt } });
    await createIntegrationLog({ userId: user.id, providerId: connection.providerId, providerSlug: connection.providerSlug, action: "user.sync", status: result.ok ? "success" : "error", responseSummary: result });
    return NextResponse.json(result);
  } catch (error) {
    await logError("Falha ao sincronizar integração", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível sincronizar a integração." }, { status: 500 });
  }
}
