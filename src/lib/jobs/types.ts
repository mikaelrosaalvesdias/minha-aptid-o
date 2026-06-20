export type WorkModel = "presencial" | "hibrido" | "remoto" | "qualquer";
export type JobLevel = "estagio" | "junior" | "pleno" | "senior" | "lideranca" | "qualquer";
export type ContractType = "clt" | "pj" | "estagio" | "freelancer" | "temporario" | "qualquer";
export type SearchFrequency = "manual" | "diaria" | "semanal";

export type JobPreferenceInput = {
  cargo?: string | null;
  area?: string | null;
  cidade?: string | null;
  estado?: string | null;
  modelo: WorkModel;
  salarioMin?: number | null;
  salarioMax?: number | null;
  nivel: JobLevel;
  contrato: ContractType;
  keywordsDesejadas: string[];
  keywordsEvitar: string[];
  aceitaSemSalario: boolean;
  aceitaForaCidade: boolean;
  frequenciaBusca: SearchFrequency;
  recebeNotificacoes: boolean;
};

export type JobProfileInput = {
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  linkedin?: string | null;
  country?: string | null;
  countryCode?: string | null;
  location?: string | null;
  workAuthorization?: string | null;
  needsVisaSponsorship?: boolean | null;
  citizenshipStatus?: string | null;
  englishLevel?: string | null;
  currentSalary?: string | null;
  currentEmployer?: string | null;
  currentRole?: string | null;
  latestSchool?: string | null;
  latestDegree?: string | null;
  onsiteAvailability?: string | null;
  applicationSource?: string | null;
  pretensaoMin?: number | null;
  pretensaoMax?: number | null;
  summary?: string | null;
};

export type RawJob = {
  title: string;
  company?: string;
  city?: string;
  state?: string;
  modelo?: string;
  salario?: string;
  contrato?: string;
  nivel?: string;
  description?: string;
  requisitos?: string[];
  beneficios?: string[];
  originalUrl: string;
  source: string;
  publishedAt?: string | Date | null;
  confidence?: number;
};

export type ScoredJob = RawJob & {
  dedupHash: string;
  compatibilityScore: number;
  compatibilityReason: string;
  compatibilityBlock?: string;
  sourceAutoSupport: SourceAutoSupport;
  atsBoard?: string;
  atsJobId?: string;
};

export type SourceAutoSupport =
  | "auto"
  | "requires_employer_auth"
  | "link_only"
  | "needs_login"
  | "has_captcha"
  | "blocks_automation"
  | "untested";

export type ApplicationStatus =
  | "aguardando"
  | "em_andamento"
  | "publicado"
  | "acao_manual"
  | "falhou"
  | "site_indisponivel"
  | "vaga_expirada"
  | "formulario_nao_reconhecido"
  | "bloqueado_captcha"
  | "bloqueado_login"
  | "bloqueado_politica";

export type QueueProgress = {
  total: number;
  publicados: number;
  falharam: number;
  acaoManual: number;
  aguardando: number;
  emAndamento: number;
};
