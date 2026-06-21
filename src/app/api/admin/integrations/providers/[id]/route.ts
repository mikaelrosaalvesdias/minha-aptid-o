import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { logError } from "@/lib/logging";
import { encryptValue } from "@/lib/integrations/crypto";
import { publicProvider } from "@/lib/integrations/types";
import { getProvider } from "@/lib/integrations/providers/registry";
import { createIntegrationLog } from "@/lib/integrations/service";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  type: z.string().min(2).optional(),
  authType: z.enum(["oauth", "api_key", "bearer_token", "partner_api", "composio", "manual_assisted", "not_available"]).optional(),
  status: z.enum(["active", "disabled", "sandbox", "pending_credentials", "pending_partner_access", "error", "deprecated", "manual_assisted"]).optional(),
  baseUrl: z.string().url().nullable().optional(),
  clientId: z.string().min(1).nullable().optional(),
  clientSecret: z.string().min(1).nullable().optional(),
  apiKey: z.string().min(1).nullable().optional(),
  webhookSecret: z.string().min(1).nullable().optional(),
  scopes: z.array(z.string()).optional(),
  capabilities: z.array(z.string()).optional(),
  settings: z.record(z.unknown()).optional(),
  isVisibleToUsers: z.boolean().optional(),
  environment: z.enum(["sandbox", "production"]).optional(),
  dailyLimit: z.number().int().min(0).optional(),
  monthlyLimit: z.number().int().min(0).optional(),
  notes: z.string().nullable().optional()
});

function updateData(payload: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  const normalized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined) normalized[key] = value;
  }

  if ("name" in normalized) data.name = normalized.name;
  if ("slug" in normalized) data.slug = normalized.slug;
  if ("type" in normalized) data.type = normalized.type;
  if ("authType" in normalized) data.authType = normalized.authType;
  if ("status" in normalized) data.status = normalized.status;
  if ("baseUrl" in normalized) data.baseUrl = normalized.baseUrl;
  if ("clientId" in normalized) data.clientIdEncrypted = normalized.clientId ? encryptValue(String(normalized.clientId)) : null;
  if ("clientSecret" in normalized) data.clientSecretEncrypted = normalized.clientSecret ? encryptValue(String(normalized.clientSecret)) : null;
  if ("apiKey" in normalized) data.apiKeyEncrypted = normalized.apiKey ? encryptValue(String(normalized.apiKey)) : null;
  if ("webhookSecret" in normalized) data.webhookSecretEncrypted = normalized.webhookSecret ? encryptValue(String(normalized.webhookSecret)) : null;
  if ("scopes" in normalized) data.scopesJson = Array.isArray(normalized.scopes) ? normalized.scopes.filter((item) => typeof item === "string") : [];
  if ("capabilities" in normalized) data.capabilitiesJson = Array.isArray(normalized.capabilities) ? normalized.capabilities.filter((item) => typeof item === "string") : [];
  if ("settings" in normalized) data.settingsJson = normalized.settings ?? {};
  if ("isVisibleToUsers" in normalized) data.isVisibleToUsers = normalized.isVisibleToUsers;
  if ("environment" in normalized) data.environment = normalized.environment;
  if ("dailyLimit" in normalized) data.dailyLimit = normalized.dailyLimit;
  if ("monthlyLimit" in normalized) data.monthlyLimit = normalized.monthlyLimit;
  if ("notes" in normalized) data.notes = normalized.notes;
  return data;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const { id } = await params;
    const provider = await prisma.integrationProvider.findUnique({ where: { id } });
    if (!provider) return NextResponse.json({ error: "Provider não encontrado." }, { status: 404 });
    return NextResponse.json({ provider: publicProvider(provider) });
  } catch (error) {
    await logError("Falha ao carregar provider de integração", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível carregar o provider." }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const { id } = await params;
    const payload = updateSchema.parse(await request.json());
    const provider = await prisma.integrationProvider.update({ where: { id }, data: updateData(payload) });
    await createIntegrationLog({ providerId: provider.id, providerSlug: provider.slug, action: "admin.update_provider", status: "success" });
    return NextResponse.json({ provider: publicProvider(provider) });
  } catch (error) {
    await logError("Falha ao atualizar provider de integração", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível atualizar o provider." }, { status: 400 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const { id } = await params;
  const provider = await prisma.integrationProvider.findUnique({ where: { id } });
  if (!provider) return NextResponse.json({ error: "Provider não encontrado." }, { status: 404 });

  try {
    const body = await request.json().catch(() => ({}));
    const action = typeof body.action === "string" ? body.action : "";
    const providerImpl = getProvider(provider.slug);

    if (action === "enable") {
      const updated = await prisma.integrationProvider.update({ where: { id }, data: { status: "active", activeAt: new Date() } });
      await createIntegrationLog({ providerId: updated.id, providerSlug: updated.slug, action: "admin.enable_provider", status: "success" });
      return NextResponse.json({ provider: publicProvider(updated) });
    }

    if (action === "disable") {
      const updated = await prisma.integrationProvider.update({ where: { id }, data: { status: "disabled" } });
      await createIntegrationLog({ providerId: updated.id, providerSlug: updated.slug, action: "admin.disable_provider", status: "success" });
      return NextResponse.json({ provider: publicProvider(updated) });
    }

    if (action === "test") {
      const result = await providerImpl?.healthcheck({ provider }) ?? { ok: false, message: "Provider não implementado." };
      await prisma.integrationProvider.update({
        where: { id },
        data: { lastHealthcheckAt: new Date(), lastHealthcheckStatus: result.ok ? "success" : "error", lastError: result.ok ? null : result.message }
      });
      await createIntegrationLog({ providerId: provider.id, providerSlug: provider.slug, action: "admin.test_provider", status: result.ok ? "success" : "error", responseSummary: result });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    await logError("Falha ao executar ação de provider", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível executar a ação." }, { status: 500 });
  }
}
