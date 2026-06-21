import { Composio } from "@composio/core";
import { IntegrationError, INTEGRATION_ERRORS } from "../errors";
import { logError } from "@/lib/logging";

let client: Composio | null = null;

function getApiKey(): string {
  const key = process.env.COMPOSIO_API_KEY;
  if (!key) {
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_NOT_CONFIGURED, "COMPOSIO_API_KEY não configurada. Configure no .env ou no admin.");
  }
  return key;
}

export function getComposioClient(): Composio {
  if (!client) {
    client = new Composio({ apiKey: getApiKey() });
  }
  return client;
}

export type ComposioConnectionResult = {
  redirectUrl: string;
  status: "pending" | "connected" | "failed";
};

export async function initiateOAuthConnection(
  userId: string,
  _providerSlug: string,
  callbackUrl: string
): Promise<ComposioConnectionResult> {
  const composio = getComposioClient();

  try {
    const result = await composio.connectedAccounts.initiate(userId, "linkedin", { callbackUrl });
    const data = result as unknown as Record<string, unknown>;
    const redirectUrl = (data?.redirectUrl as string) ?? "";

    if (!redirectUrl) {
      await logError("Composio OAuth initiate retornou sem redirectUrl", { userId, _providerSlug });
      throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_AUTH_FAILED, "Não foi possível iniciar a conexão com o provedor.");
    }

    return { redirectUrl, status: "pending" };
  } catch (error) {
    if (error instanceof IntegrationError) throw error;
    await logError("Composio OAuth initiate error", { error: String(error), userId, _providerSlug });
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_AUTH_FAILED, "Erro ao iniciar conexão OAuth.");
  }
}

export async function waitForOAuthConnection(
  connectedAccountId: string,
  timeoutMs = 60000
) {
  const composio = getComposioClient();
  try {
    return await composio.connectedAccounts.waitForConnection(connectedAccountId, timeoutMs);
  } catch (error) {
    await logError("Composio waitForConnection error", { error: String(error), connectedAccountId });
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_AUTH_FAILED, "Erro ao aguardar conexão OAuth.");
  }
}

type ExecuteToolParams = {
  toolSlug: string;
  userId: string;
  connectedAccountId: string;
  arguments?: Record<string, unknown>;
  version?: string;
};

export async function executeTool<T = unknown>(params: ExecuteToolParams): Promise<T> {
  const composio = getComposioClient();
  try {
    const result = await composio.tools.execute(params.toolSlug, {
      userId: params.userId,
      connectedAccountId: params.connectedAccountId,
      arguments: params.arguments ?? {},
      version: params.version ?? "20260424_00"
    }) as unknown as { successful: boolean; data: T; error?: string | null };

    if (!result.successful) {
      throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_AUTH_FAILED, result.error ?? "Erro ao executar ação no provedor.");
    }

    return result.data as T;
  } catch (error) {
    if (error instanceof IntegrationError) throw error;
    await logError("Composio executeTool error", { error: String(error), toolSlug: params.toolSlug });
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_CAPABILITY_NOT_AVAILABLE, "Erro ao executar ação.");
  }
}
