export type IntegrationSeed = {
  name: string;
  slug: string;
  type: string;
  authType: string;
  status: string;
  capabilities: string[];
  scopes: string[];
  environment: string;
  isVisibleToUsers: boolean;
  notes: string;
};

export const integrationProviders: IntegrationSeed[] = [
  {
    name: "LinkedIn",
    slug: "linkedin",
    type: "profile_network",
    authType: "composio",
    status: "active",
    capabilities: ["connect_account", "sync_profile", "publish_resume_link"],
    scopes: ["r_liteprofile", "r_emailaddress", "w_member_social"],
    environment: "production",
    isVisibleToUsers: true,
    notes: "Integração via Composio. Conecta, sincroniza perfil e publica post com link do currículo."
  },
  {
    name: "Gupy",
    slug: "gupy",
    type: "job_distribution",
    authType: "api_key",
    status: "pending_partner_access",
    capabilities: ["search_jobs", "get_job_details"],
    scopes: [],
    environment: "production",
    isVisibleToUsers: true,
    notes: "Sem API/parceria de candidato configurada. Não candidatar automaticamente."
  },
  {
    name: "Catho",
    slug: "catho",
    type: "job_distribution",
    authType: "manual_assisted",
    status: "manual_assisted",
    capabilities: ["match_jobs"],
    scopes: [],
    environment: "production",
    isVisibleToUsers: true,
    notes: "Sem API oficial de candidato disponível. Fluxo manual assistido apenas."
  },
  {
    name: "Vagas.com.br",
    slug: "vagas-com-br",
    type: "job_distribution",
    authType: "partner_api",
    status: "pending_partner_access",
    capabilities: ["import_jobs", "search_jobs"],
    scopes: [],
    environment: "production",
    isVisibleToUsers: true,
    notes: "Preparado para feed/API de vagas. Candidatura automática depende de parceria/API."
  },
  {
    name: "InfoJobs",
    slug: "infojobs",
    type: "job_distribution",
    authType: "api_key",
    status: "pending_partner_access",
    capabilities: ["search_jobs"],
    scopes: [],
    environment: "production",
    isVisibleToUsers: true,
    notes: "Sem API oficial de candidato disponível no ambiente atual."
  },
  {
    name: "Indeed Brasil",
    slug: "indeed-brasil",
    type: "job_distribution",
    authType: "partner_api",
    status: "pending_partner_access",
    capabilities: ["search_jobs"],
    scopes: [],
    environment: "production",
    isVisibleToUsers: true,
    notes: "Indeed Apply depende de acesso de parceiro. Sem candidatura automática sem API oficial."
  },
  {
    name: "Manual Assisted",
    slug: "manual-assisted",
    type: "manual_assisted",
    authType: "manual_assisted",
    status: "active",
    capabilities: ["match_jobs", "external_redirect", "manual_apply"],
    scopes: [],
    environment: "production",
    isVisibleToUsers: false,
    notes: "Provider interno para fluxos manuais com consentimento explícito."
  }
];
