import { prisma } from "@/lib/prisma";
import { list } from "./types";

export async function createIntegrationLog(input: {
  userId?: string | null;
  providerId?: string | null;
  providerSlug: string;
  action: string;
  status: string;
  requestSummary?: unknown;
  responseSummary?: unknown;
  errorMessage?: string | null;
}) {
  return prisma.integrationLog.create({
    data: {
      userId: input.userId ?? null,
      providerId: input.providerId ?? null,
      providerSlug: input.providerSlug,
      action: input.action,
      status: input.status,
      requestSummaryJson: input.requestSummary ?? {},
      responseSummaryJson: input.responseSummary ?? {},
      errorMessage: input.errorMessage ?? null
    }
  });
}

export function normalizeProviderPayload(payload: Record<string, unknown>) {
  return {
    name: typeof payload.name === "string" ? payload.name : undefined,
    slug: typeof payload.slug === "string" ? payload.slug : undefined,
    type: typeof payload.type === "string" ? payload.type : undefined,
    authType: typeof payload.authType === "string" ? payload.authType : undefined,
    status: typeof payload.status === "string" ? payload.status : undefined,
    baseUrl: payload.baseUrl === undefined ? undefined : typeof payload.baseUrl === "string" ? payload.baseUrl : null,
    clientId: payload.clientId === undefined ? undefined : typeof payload.clientId === "string" ? payload.clientId : null,
    clientSecret: payload.clientSecret === undefined ? undefined : typeof payload.clientSecret === "string" ? payload.clientSecret : null,
    apiKey: payload.apiKey === undefined ? undefined : typeof payload.apiKey === "string" ? payload.apiKey : null,
    webhookSecret: payload.webhookSecret === undefined ? undefined : typeof payload.webhookSecret === "string" ? payload.webhookSecret : null,
    scopes: Array.isArray(payload.scopes) ? payload.scopes.filter((item): item is string => typeof item === "string") : undefined,
    capabilities: Array.isArray(payload.capabilities) ? payload.capabilities.filter((item): item is string => typeof item === "string") : undefined,
    settings: payload.settings && typeof payload.settings === "object" ? payload.settings as Record<string, unknown> : undefined,
    isVisibleToUsers: typeof payload.isVisibleToUsers === "boolean" ? payload.isVisibleToUsers : undefined,
    environment: payload.environment === "sandbox" || payload.environment === "production" ? payload.environment : undefined,
    dailyLimit: typeof payload.dailyLimit === "number" ? payload.dailyLimit : undefined,
    monthlyLimit: typeof payload.monthlyLimit === "number" ? payload.monthlyLimit : undefined,
    notes: payload.notes === undefined ? undefined : typeof payload.notes === "string" ? payload.notes : null
  };
}

export function providerHasSecret(provider: { clientIdEncrypted?: string | null; clientSecretEncrypted?: string | null; apiKeyEncrypted?: string | null; webhookSecretEncrypted?: string | null }) {
  return Boolean(provider.clientIdEncrypted || provider.clientSecretEncrypted || provider.apiKeyEncrypted || provider.webhookSecretEncrypted);
}

export function publicProviderList(value: unknown) {
  return list(value);
}
