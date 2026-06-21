import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { logError } from "@/lib/logging";
import { getProvider } from "@/lib/integrations/providers/registry";
import { publicProvider } from "@/lib/integrations/types";
import { createIntegrationLog } from "@/lib/integrations/service";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const providers = await prisma.integrationProvider.findMany({ orderBy: { name: "asc" } });
    const health = [];
    for (const provider of providers) {
      const result = await getProvider(provider.slug)?.healthcheck({ provider }) ?? { ok: false, message: "Provider não implementado." };
      health.push({ id: provider.id, slug: provider.slug, ...result });
      await createIntegrationLog({ providerId: provider.id, providerSlug: provider.slug, action: "admin.healthcheck", status: result.ok ? "success" : "error", responseSummary: result });
    }
    return NextResponse.json({ health, providers: providers.map(publicProvider) });
  } catch (error) {
    await logError("Falha ao verificar saúde das integrações", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível verificar integrações." }, { status: 500 });
  }
}
