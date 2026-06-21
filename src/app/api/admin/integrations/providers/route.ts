import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { logError } from "@/lib/logging";
import { encryptValue } from "@/lib/integrations/crypto";
import { publicProvider } from "@/lib/integrations/types";
import { normalizeProviderPayload } from "@/lib/integrations/service";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const providerSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  type: z.string().min(2).default("job_distribution"),
  authType: z.enum(["oauth", "api_key", "bearer_token", "partner_api", "composio", "manual_assisted", "not_available"]),
  status: z.enum(["active", "disabled", "sandbox", "pending_credentials", "pending_partner_access", "error", "deprecated", "manual_assisted"]),
  baseUrl: z.string().url().nullable().optional(),
  clientId: z.string().min(1).nullable().optional(),
  clientSecret: z.string().min(1).nullable().optional(),
  apiKey: z.string().min(1).nullable().optional(),
  webhookSecret: z.string().min(1).nullable().optional(),
  scopes: z.array(z.string()).default([]),
  capabilities: z.array(z.string()).default([]),
  settings: z.record(z.unknown()).optional(),
  isVisibleToUsers: z.boolean().default(false),
  environment: z.enum(["sandbox", "production"]).default("production"),
  dailyLimit: z.number().int().min(0).default(0),
  monthlyLimit: z.number().int().min(0).default(0),
  notes: z.string().nullable().optional()
});

function buildData(payload: z.infer<typeof providerSchema>) {
  const normalized = normalizeProviderPayload(payload as Record<string, unknown>);
  return {
    name: normalized.name ?? payload.name,
    slug: normalized.slug ?? payload.slug,
    type: normalized.type ?? payload.type,
    authType: normalized.authType as string,
    status: normalized.status as string,
    baseUrl: normalized.baseUrl as string | null ?? null,
    clientIdEncrypted: normalized.clientId ? encryptValue(normalized.clientId) : undefined,
    clientSecretEncrypted: normalized.clientSecret ? encryptValue(normalized.clientSecret) : undefined,
    apiKeyEncrypted: normalized.apiKey ? encryptValue(normalized.apiKey) : undefined,
    webhookSecretEncrypted: normalized.webhookSecret ? encryptValue(normalized.webhookSecret) : undefined,
    scopesJson: normalized.scopes ?? [],
    capabilitiesJson: normalized.capabilities ?? [],
    settingsJson: (normalized.settings ?? {}) as Prisma.InputJsonValue,
    isVisibleToUsers: normalized.isVisibleToUsers ?? false,
    environment: normalized.environment ?? "production",
    dailyLimit: normalized.dailyLimit ?? 0,
    monthlyLimit: normalized.monthlyLimit ?? 0,
    notes: normalized.notes as string | null ?? null
  };
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const providers = await prisma.integrationProvider.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ providers: providers.map(publicProvider) });
  } catch (error) {
    await logError("Falha ao listar providers de integração", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível carregar integrações." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const payload = providerSchema.parse(await request.json());
    const provider = await prisma.integrationProvider.create({ data: buildData(payload) });
    return NextResponse.json({ provider: publicProvider(provider) });
  } catch (error) {
    await logError("Falha ao criar provider de integração", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível criar o provider." }, { status: 400 });
  }
}
