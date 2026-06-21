import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logging";
import { waitForOAuthConnection } from "@/lib/integrations/composio/client";
import { createIntegrationLog } from "@/lib/integrations/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const connectedAccountId = searchParams.get("connectedAccountId");
  const status = searchParams.get("status");
  const userId = searchParams.get("userId");
  const slug = searchParams.get("slug");
  const redirect = searchParams.get("redirect") || "/perfil";

  if (!connectedAccountId || status !== "success") {
    await logError("Composio callback com erro ou sem connectedAccountId", { connectedAccountId, status, userId, slug });
    return NextResponse.redirect(new URL(`/perfil?error=conexao_falhou`, request.url));
  }

  try {
    const connectedAccount = await waitForOAuthConnection(connectedAccountId, 30000);
    const ca = connectedAccount as Record<string, unknown>;

    const provider = await prisma.integrationProvider.findUnique({ where: { slug: slug || "linkedin" } });
    if (!provider) {
      await logError("Provider não encontrado no callback Composio", { slug });
      return NextResponse.redirect(new URL(`${redirect}?error=provider_nao_encontrado`, request.url));
    }

    const existingConnection = await prisma.userExternalConnection.findFirst({
      where: { userId: userId || "", providerId: provider.id }
    });

    if (existingConnection) {
      await prisma.userExternalConnection.update({
        where: { id: existingConnection.id },
        data: {
          connectionStatus: "connected",
          composioConnectionId: connectedAccountId,
          externalAccountName: (ca?.accountName as string) ?? null,
          lastSyncAt: new Date()
        }
      });
    } else if (userId) {
      await prisma.userExternalConnection.create({
        data: {
          userId,
          providerId: provider.id,
          providerSlug: provider.slug,
          connectionStatus: "connected",
          authType: "composio",
          composioConnectionId: connectedAccountId,
          composioEntityId: userId,
          externalAccountName: (ca?.accountName as string) ?? null,
          lastSyncAt: new Date()
        }
      });
    }

    await createIntegrationLog({
      userId: userId || undefined,
      providerId: provider.id,
      providerSlug: provider.slug,
      action: "user.callback",
      status: "success",
      responseSummary: { connectedAccountId }
    });

    return NextResponse.redirect(new URL(`${redirect}?connected=${slug}`, request.url));
  } catch (error) {
    await logError("Composio callback processing error", { error: String(error), connectedAccountId, userId, slug });
    return NextResponse.redirect(new URL(`/perfil?error=conexao_falhou`, request.url));
  }
}
