import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { logError } from "@/lib/logging";
import { getProvider } from "@/lib/integrations/providers/registry";
import { createIntegrationLog } from "@/lib/integrations/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { id: providerSlug } = await params;
  const provider = await prisma.integrationProvider.findUnique({ where: { slug: providerSlug } });
  if (!provider) return NextResponse.json({ error: "Provider não encontrado." }, { status: 404 });

  try {
    const payload = await request.json().catch(() => ({}));
    const connection = await prisma.userExternalConnection.findFirst({ where: { userId: user.id, providerId: provider.id } });
    if (!connection) return NextResponse.json({ error: "Conexão não encontrada." }, { status: 404 });

    const result = await getProvider(provider.slug)?.handleCallback(payload, { provider, connection }) ?? { ok: false, message: "Callback não implementado." };
    await createIntegrationLog({ userId: user.id, providerId: provider.id, providerSlug: provider.slug, action: "user.callback", status: result.ok ? "success" : "error", requestSummary: payload, responseSummary: result });
    return NextResponse.json(result);
  } catch (error) {
    await logError("Falha ao processar callback de integração", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível processar o callback." }, { status: 500 });
  }
}
