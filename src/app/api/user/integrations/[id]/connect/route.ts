import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { logError } from "@/lib/logging";
import { canConnect, publicProvider } from "@/lib/integrations/types";
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
    const providerImpl = getProvider(provider.slug);
    const body = await request.json().catch(() => ({}));
    const redirectUrl = typeof body.redirectUrl === "string" ? body.redirectUrl : `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/perfil`;

    if (!provider.isVisibleToUsers || provider.status === "disabled") {
      return NextResponse.json({ error: "Provider indisponível." }, { status: 403 });
    }

    if (!canConnect(publicProvider(provider))) {
      await createIntegrationLog({ userId: user.id, providerId: provider.id, providerSlug: provider.slug, action: "user.connect_attempt", status: "blocked", responseSummary: { reason: provider.status } });
      return NextResponse.json({ error: provider.status === "pending_credentials" || provider.status === "pending_partner_access" ? "Integração em breve. Ainda não há fluxo real configurado." : "Este provider não permite conexão automática.", redirectUrl: undefined }, { status: 409 });
    }

    const result = await providerImpl?.connectAccount(user.id, redirectUrl, { provider }) ?? { redirectUrl };
    await createIntegrationLog({ userId: user.id, providerId: provider.id, providerSlug: provider.slug, action: "user.connect", status: "pending", responseSummary: result });
    return NextResponse.json(result);
  } catch (error) {
    await logError("Falha ao iniciar conexão de integração", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível iniciar a conexão." }, { status: 500 });
  }
}
