import { IntegrationError, INTEGRATION_ERRORS } from "../errors";
import { list } from "../types";
import type { IntegrationProvider, UserExternalConnection } from "@prisma/client";
import type { ProviderCapability } from "../types";

export type ProviderContext = {
  provider: IntegrationProvider;
  connection?: UserExternalConnection | null;
};

export abstract class JobProvider {
  abstract slug: string;
  abstract name: string;

  protected requireCapability(provider: IntegrationProvider, capability: ProviderCapability) {
    if (!list(provider.capabilitiesJson).includes(capability)) {
      throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_CAPABILITY_NOT_AVAILABLE, `${this.name} não suporta esta operação.`);
    }
  }

  protected requireActive(provider: IntegrationProvider) {
    if (provider.status === "disabled") throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_DISABLED, `${this.name} está desativado.`, 403);
    if (provider.status === "pending_credentials" || provider.status === "pending_partner_access") {
      throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_NOT_CONFIGURED, `${this.name} ainda não está configurado.`);
    }
    if (provider.status === "error") throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_AUTH_FAILED, `${this.name} está com erro de integração.`);
  }

  protected requireEnv(name: string) {
    if (!process.env[name]) throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_NOT_CONFIGURED, `Variável ${name} não configurada.`);
    return process.env[name] as string;
  }

  async connectAccount(_userId: string, _redirectUrl: string, _context: ProviderContext): Promise<Record<string, unknown>> {
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_CAPABILITY_NOT_AVAILABLE, "Conexão externa não disponível para este provider.");
  }

  async handleCallback(_payload: unknown, _context: ProviderContext): Promise<Record<string, unknown>> {
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_CAPABILITY_NOT_AVAILABLE, "Callback não disponível para este provider.");
  }

  async disconnectAccount(_connectionId: string, _context: ProviderContext): Promise<Record<string, unknown>> {
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_CAPABILITY_NOT_AVAILABLE, "Desconexão não disponível para este provider.");
  }

  async syncProfile(_connection: UserExternalConnection, _context: ProviderContext): Promise<Record<string, unknown>> {
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_CAPABILITY_NOT_AVAILABLE, "Sincronização de perfil não disponível para este provider.");
  }

  async searchJobs(_filters: Record<string, unknown>, _context: ProviderContext): Promise<Record<string, unknown>> {
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_CAPABILITY_NOT_AVAILABLE, "Busca de vagas não disponível para este provider.");
  }

  async importJobs(_filters: Record<string, unknown>, _context: ProviderContext): Promise<Record<string, unknown>> {
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_CAPABILITY_NOT_AVAILABLE, "Importação de vagas não disponível para este provider.");
  }

  async getJobDetails(_externalJobId: string, _context: ProviderContext): Promise<Record<string, unknown>> {
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_CAPABILITY_NOT_AVAILABLE, "Detalhes da vaga não disponíveis para este provider.");
  }

  async submitApplication(_userId: string, _jobId: string, _resumeVersionId: string | null, _context: ProviderContext): Promise<Record<string, unknown>> {
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_CAPABILITY_NOT_AVAILABLE, "Candidatura automática não disponível para este provider.");
  }

  async getApplicationStatus(_applicationId: string, _context: ProviderContext): Promise<Record<string, unknown>> {
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_CAPABILITY_NOT_AVAILABLE, "Status de candidatura não disponível para este provider.");
  }

  async uploadResume(_userId: string, _resumeVersionId: string, _context: ProviderContext): Promise<Record<string, unknown>> {
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_CAPABILITY_NOT_AVAILABLE, "Upload de currículo não disponível para este provider.");
  }

  async publishResumeLink(_userId: string, _connection: UserExternalConnection, _resumeUrl: string, _commentary: string): Promise<Record<string, unknown>> {
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_CAPABILITY_NOT_AVAILABLE, "Publicação de link do currículo não disponível para este provider.");
  }

  async healthcheck(context: ProviderContext) {
    const { provider } = context;
    return { ok: provider.status === "active", message: provider.status === "active" ? "Provider ativo." : `Provider em ${provider.status}.` };
  }
}
