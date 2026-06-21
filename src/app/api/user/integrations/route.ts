import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { logError } from "@/lib/logging";
import { canConnect, publicProvider } from "@/lib/integrations/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  try {
    const [providers, connections] = await Promise.all([
      prisma.integrationProvider.findMany({ where: { isVisibleToUsers: true }, orderBy: { name: "asc" } }),
      prisma.userExternalConnection.findMany({
        where: { userId: user.id },
        include: { provider: true },
        orderBy: { createdAt: "desc" }
      })
    ]);

    return NextResponse.json({
      providers: providers.map(publicProvider).map((provider) => ({ ...provider, canConnect: canConnect(provider) })),
      connections: connections.map((connection) => ({
        id: connection.id,
        providerSlug: connection.providerSlug,
        providerName: connection.provider.name,
        connectionStatus: connection.connectionStatus,
        externalEmail: connection.externalEmail,
        externalAccountName: connection.externalAccountName,
        lastSyncAt: connection.lastSyncAt,
        authType: connection.authType
      }))
    });
  } catch (error) {
    await logError("Falha ao listar integrações do usuário", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível carregar integrações." }, { status: 500 });
  }
}
