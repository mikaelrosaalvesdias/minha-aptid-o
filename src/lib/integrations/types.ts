import type { IntegrationProvider } from "@prisma/client";

export type ProviderCapability =
  | "connect_account"
  | "sync_profile"
  | "search_jobs"
  | "import_jobs"
  | "match_jobs"
  | "upload_resume"
  | "submit_application"
  | "publish_resume_link"
  | "get_application_status"
  | "webhooks"
  | "external_redirect"
  | "manual_apply";

export type ProviderAuthType =
  | "oauth"
  | "api_key"
  | "bearer_token"
  | "partner_api"
  | "composio"
  | "manual_assisted"
  | "not_available";

export type ProviderStatus =
  | "active"
  | "disabled"
  | "sandbox"
  | "pending_credentials"
  | "pending_partner_access"
  | "error"
  | "deprecated"
  | "manual_assisted";

export type ProviderConnectionStatus = "connected" | "expired" | "revoked" | "error" | "pending" | "disabled";

export type IntegrationProviderPayload = {
  id?: string;
  name: string;
  slug: string;
  type: string;
  authType: ProviderAuthType;
  status: ProviderStatus;
  baseUrl?: string | null;
  clientId?: string | null;
  clientSecret?: string | null;
  apiKey?: string | null;
  webhookSecret?: string | null;
  scopes?: string[];
  capabilities?: ProviderCapability[];
  settings?: Record<string, unknown>;
  isVisibleToUsers: boolean;
  environment: "sandbox" | "production";
  dailyLimit: number;
  monthlyLimit: number;
  notes?: string | null;
};

export type PublicProvider = {
  id: string;
  name: string;
  slug: string;
  type: string;
  authType: ProviderAuthType;
  status: ProviderStatus;
  baseUrl: string | null;
  capabilities: ProviderCapability[];
  scopes: string[];
  isVisibleToUsers: boolean;
  environment: string;
  dailyLimit: number;
  monthlyLimit: number;
  lastHealthcheckAt: Date | null;
  lastHealthcheckStatus: string | null;
  lastError: string | null;
  activeAt: Date | null;
  notes: string | null;
};

export type PublicConnection = {
  id: string;
  providerSlug: string;
  providerName: string;
  connectionStatus: ProviderConnectionStatus;
  externalEmail: string | null;
  externalAccountName: string | null;
  lastSyncAt: Date | null;
  authType: ProviderAuthType;
};

export function list(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function capabilities(provider: Pick<IntegrationProvider, "capabilitiesJson">): ProviderCapability[] {
  return list(provider.capabilitiesJson) as ProviderCapability[];
}

export function hasCapability(provider: Pick<IntegrationProvider, "capabilitiesJson">, capability: ProviderCapability) {
  return capabilities(provider).includes(capability);
}

export function canShowToUser(provider: PublicProvider) {
  return provider.isVisibleToUsers && provider.status !== "disabled" && provider.status !== "deprecated";
}

export function canConnect(provider: PublicProvider) {
  return canShowToUser(provider) && provider.capabilities.includes("connect_account") && provider.authType !== "not_available" && provider.status === "active";
}

export function publicProvider(provider: IntegrationProvider): PublicProvider {
  return {
    id: provider.id,
    name: provider.name,
    slug: provider.slug,
    type: provider.type,
    authType: provider.authType as ProviderAuthType,
    status: provider.status as ProviderStatus,
    baseUrl: provider.baseUrl,
    capabilities: capabilities(provider),
    scopes: list(provider.scopesJson),
    isVisibleToUsers: provider.isVisibleToUsers,
    environment: provider.environment,
    dailyLimit: provider.dailyLimit,
    monthlyLimit: provider.monthlyLimit,
    lastHealthcheckAt: provider.lastHealthcheckAt,
    lastHealthcheckStatus: provider.lastHealthcheckStatus,
    lastError: provider.lastError,
    activeAt: provider.activeAt,
    notes: provider.notes
  };
}
