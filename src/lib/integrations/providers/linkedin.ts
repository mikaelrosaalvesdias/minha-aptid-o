import { IntegrationError, INTEGRATION_ERRORS } from "../errors";
import { JobProvider, ProviderContext } from "./base";
import { initiateOAuthConnection, executeTool } from "../composio/client";
import type { UserExternalConnection } from "@prisma/client";

export class LinkedInProvider extends JobProvider {
  slug = "linkedin";
  name = "LinkedIn";

  getCallbackBaseUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL || "https://minhaaptidao.com.br";
  }

  async connectAccount(userId: string, postConnectRedirect: string, context: ProviderContext) {
    this.requireEnv("COMPOSIO_API_KEY");
    const { provider } = context;

    if (provider.status !== "active") {
      throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_NOT_CONFIGURED, "LinkedIn não está ativo. Configure no admin primeiro.");
    }

    const callbackUrl = `${this.getCallbackBaseUrl()}/api/user/integrations/callback?userId=${userId}&slug=linkedin&redirect=${encodeURIComponent(postConnectRedirect)}`;

    const result = await initiateOAuthConnection(userId, "linkedin", callbackUrl);
    return result as unknown as Record<string, unknown>;
  }

  async syncProfile(connection: UserExternalConnection, _context: ProviderContext) {
    this.requireEnv("COMPOSIO_API_KEY");

    if (!connection.composioConnectionId) {
      throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_AUTH_FAILED, "Conexão LinkedIn não possui ID Composio. Reconecte a conta.");
    }

    const profile = await executeTool({
      toolSlug: "LINKEDIN_GET_MY_INFO",
      userId: connection.userId,
      connectedAccountId: connection.composioConnectionId
    });

    return { ok: true, profile } as unknown as Record<string, unknown>;
  }

  async publishResumeLink(userId: string, connection: UserExternalConnection, resumeUrl: string, commentary: string) {
    this.requireEnv("COMPOSIO_API_KEY");

    if (!connection.composioConnectionId) {
      throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_AUTH_FAILED, "Conexão LinkedIn não possui ID Composio. Reconecte a conta.");
    }

    const result = await executeTool({
      toolSlug: "LINKEDIN_CREATE_LINKED_IN_POST",
      userId,
      connectedAccountId: connection.composioConnectionId,
      arguments: {
        commentary: `${commentary}\n\n${resumeUrl}`,
        visibility: "PUBLIC"
      }
    });

    return { ok: true, postResult: result } as unknown as Record<string, unknown>;
  }
}
