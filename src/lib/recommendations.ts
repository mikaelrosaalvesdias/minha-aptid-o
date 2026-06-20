import type { TopProfileResult } from "./types";

const baseSearchUrl = "https://www.google.com/search?q=";

export function encodeQuery(query: string) {
  return encodeURIComponent(query.trim()).replace(/%20/g, "+");
}

export function youtubeSearchUrl(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeQuery(`${query} iniciante português`)}`;
}

export function googleSearchUrl(query: string) {
  return `${baseSearchUrl}${encodeQuery(query)}`;
}

export function providerSearchLinks(keyword: string) {
  const encoded = encodeQuery(keyword);
  return [
    { label: "Buscar no YouTube", url: youtubeSearchUrl(keyword) },
    { label: "Buscar cursos gratuitos", url: googleSearchUrl(`${keyword} curso gratuito`) },
    { label: "Buscar no Google", url: googleSearchUrl(keyword) },
    { label: "Buscar no Sebrae", url: `https://www.google.com/search?q=${encoded}+site%3Asebrae.com.br` },
    { label: "Fundação Bradesco", url: `https://www.google.com/search?q=${encoded}+site%3Aev.org.br` },
    { label: "Escola Virtual do Governo", url: `https://www.google.com/search?q=${encoded}+site%3Aescolavirtual.gov.br` }
  ];
}

export function uniqueKeywords(topProfiles: TopProfileResult[], limit = 8) {
  const keywords = new Set<string>();
  for (const profile of topProfiles) {
    for (const keyword of profile.searchKeywords) {
      keywords.add(keyword);
      if (keywords.size >= limit) return Array.from(keywords);
    }
  }
  return Array.from(keywords);
}

export function actionPlan7Days() {
  return [
    "Dia 1: Ler o resultado e marcar os pontos que fizeram sentido.",
    "Dia 2: Assistir 2 vídeos recomendados sobre o perfil principal.",
    "Dia 3: Iniciar 1 curso introdutório gratuito.",
    "Dia 4: Fazer 1 teste prático de capacidade.",
    "Dia 5: Pesquisar faculdades, cursos técnicos ou trilhas curtas relacionadas.",
    "Dia 6: Montar uma lista com 3 áreas favoritas e o motivo de cada uma.",
    "Dia 7: Escolher o primeiro curso para seguir por 30 dias."
  ];
}

export function actionPlan30Days() {
  return [
    "Semana 1: Explorar vídeos, cursos gratuitos e relatos reais das áreas indicadas.",
    "Semana 2: Fazer um curso introdutório e registrar dúvidas, facilidades e dificuldades.",
    "Semana 3: Criar um projeto simples, simulação ou exercício prático ligado ao perfil.",
    "Semana 4: Comparar as áreas, conversar com pessoas da área e decidir o próximo passo de estudo."
  ];
}
