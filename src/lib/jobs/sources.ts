import type { SourceAutoSupport } from "./types";

type SourceInfo = {
  id: string;
  label: string;
  autoSupport: SourceAutoSupport;
  note: string;
};

// Camada de compatibilidade por fonte.
// Nenhum portal público brasileiro permite candidatura automática segura sem
// login/captcha. Portanto todas as fontes reais começam como "link_only" ou
// "needs_login". O framework suporta "auto" caso uma fonte compatível seja
// adicionada no futuro (ex: ATS próprio com API).
export const JOB_SOURCES: Record<string, SourceInfo> = {
  remotive: {
    id: "remotive",
    label: "Remotive",
    autoSupport: "link_only",
    note: "Portal de vagas remotas. Candidatura direcionada ao site oficial."
  },
  remoteok: {
    id: "remoteok",
    label: "RemoteOK",
    autoSupport: "link_only",
    note: "Vagas remotas. Abrir link para candidatura."
  },
  greenhouse: {
    id: "greenhouse",
    label: "Greenhouse ATS",
    autoSupport: "requires_employer_auth",
    note: "O envio automático exige chave privada da empresa. Abra a vaga e use o pacote de candidatura preparado."
  },
  lever: {
    id: "lever",
    label: "Lever ATS",
    autoSupport: "auto",
    note: "Candidatura automática via API pública. Sem login, sem credencial armazenada."
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    autoSupport: "needs_login",
    note: "Exige login. Usar copiar dados + abrir link."
  },
  indeed: {
    id: "indeed",
    label: "Indeed",
    autoSupport: "needs_login",
    note: "Exige login. Usar copiar dados + abrir link."
  },
  vagas: {
    id: "vagas",
    label: "Vagas.com",
    autoSupport: "needs_login",
    note: "Exige cadastro. Usar copiar dados + abrir link."
  },
  catho: {
    id: "catho",
    label: "Catho",
    autoSupport: "needs_login",
    note: "Exige assinatura/login. Usar copiar dados + abrir link."
  },
  infojobs: {
    id: "infojobs",
    label: "InfoJobs",
    autoSupport: "needs_login",
    note: "Exige login. Usar copiar dados + abrir link."
  },
  google_jobs: {
    id: "google_jobs",
    label: "Google Vagas",
    autoSupport: "link_only",
    note: "Agregador. Abrir link para ver detalhes no portal de origem."
  },
  curado: {
    id: "curado",
    label: "Busca curada",
    autoSupport: "link_only",
    note: "Link de busca gerado a partir do seu perfil."
  }
};

export function sourceInfo(sourceId: string): SourceInfo {
  return (
    JOB_SOURCES[sourceId] ?? {
      id: sourceId,
      label: sourceId,
      autoSupport: "untested",
      note: "Fonte não testada."
    }
  );
}

// Gera links de busca reais em portais BR a partir de cargo/área/local.
export function buildBoardSearchUrls(params: {
  cargo?: string | null;
  area?: string | null;
  cidade?: string | null;
  estado?: string | null;
  modelo?: string | null;
  keywords?: string[];
}) {
  const term = [params.cargo, params.area, ...(params.keywords ?? [])]
    .filter(Boolean)
    .map((s) => String(s).trim())
    .filter(Boolean)
    .join(" ");
  const location = [params.cidade, params.estado].filter(Boolean).join(", ");
  const q = term || "vaga";
  const where = location ? `&where=${encodeURIComponent(location)}` : "";

  return [
    {
      source: "linkedin",
      title: `LinkedIn: ${term}${location ? " em " + location : ""}`,
      url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(term)}${location ? "&location=" + encodeURIComponent(location) : ""}`
    },
    {
      source: "indeed",
      title: `Indeed: ${term}${location ? " em " + location : ""}`,
      url: `https://br.indeed.com/jobs?q=${encodeURIComponent(term)}${where}`
    },
    {
      source: "vagas",
      title: `Vagas.com: ${term}${location ? " em " + location : ""}`,
      url: `https://www.vagas.com.br/vagas-de-${encodeURIComponent(term.toLowerCase().replace(/\s+/g, "-"))}${params.cidade ? "-" + encodeURIComponent(params.cidade.toLowerCase()) : ""}`
    },
    {
      source: "infojobs",
      title: `InfoJobs: ${term}${location ? " em " + location : ""}`,
      url: `https://www.infojobs.com.br/vagas-de-trabalho.aspx?palabra=${encodeURIComponent(term)}${params.cidade ? "&provincia=" + encodeURIComponent(params.cidade) : ""}`
    },
    {
      source: "google_jobs",
      title: `Google Vagas: ${term}${location ? " em " + location : ""}`,
      url: `https://www.google.com/search?q=${encodeURIComponent(term + " vaga" + (location ? " " + location : ""))}&ibp=htl;jobs`
    }
  ];
}
