export type ProfileSlug =
  | "comercial-vendas"
  | "atendimento-sucesso-cliente"
  | "administrativo-financeiro"
  | "marketing-conteudo"
  | "tecnologia-suporte"
  | "dados-analise"
  | "educacao-treinamento"
  | "recursos-humanos"
  | "design-criatividade"
  | "operacoes-processos";

export type SeedProfile = {
  name: string;
  slug: ProfileSlug;
  description: string;
  strengths: string[];
  attentionPoints: string[];
  suggestedDegrees: string[];
  suggestedShortCourses: string[];
  searchKeywords: string[];
};

export type SeedCourseRecommendation = {
  profileSlug: ProfileSlug;
  title: string;
  provider: string;
  url: string;
  type: string;
  source: string;
  order: number;
};

export const profiles: SeedProfile[] = [
  {
    name: "Comercial e Vendas",
    slug: "comercial-vendas",
    description:
      "Indica afinidade com comunicação, metas, negociação e construção de confiança. Pode combinar com funções em vendas consultivas, gestão comercial, prospecção, pós-venda e crescimento de receita.",
    strengths: ["Comunicação", "Persuasão", "Negociação", "Metas", "Atendimento"],
    attentionPoints: ["Aprofundar técnicas de venda consultiva", "Organizar funil e rotina comercial", "Praticar análise simples de indicadores"],
    suggestedDegrees: ["Gestão Comercial", "Marketing", "Administração", "Processos Gerenciais"],
    suggestedShortCourses: ["Vendas consultivas", "Customer Success", "Negociação", "CRM para iniciantes", "Marketing digital básico"],
    searchKeywords: [
      "curso gratuito customer success",
      "curso gratuito gestão comercial",
      "curso gratuito vendas consultivas",
      "curso gratuito negociação",
      "curso gratuito CRM para iniciantes"
    ]
  },
  {
    name: "Atendimento e Sucesso do Cliente",
    slug: "atendimento-sucesso-cliente",
    description:
      "Mostra inclinação para escuta, paciência, comunicação sob pressão e resolução de problemas de clientes. É um caminho natural para quem já lidou com público e quer migrar para experiências mais consultivas.",
    strengths: ["Escuta ativa", "Paciência", "Comunicação", "Resolução de problemas", "Acolhimento"],
    attentionPoints: ["Praticar escrita objetiva", "Aprender métricas de satisfação", "Desenvolver repertório em ferramentas de atendimento"],
    suggestedDegrees: ["Gestão Comercial", "Administração", "Gestão de RH", "Marketing"],
    suggestedShortCourses: ["Atendimento ao cliente", "Customer Success", "Experiência do Cliente", "Comunicação não violenta", "Suporte com CRM"],
    searchKeywords: [
      "curso gratuito atendimento ao cliente",
      "curso gratuito customer success iniciante",
      "curso gratuito experiência do cliente",
      "curso gratuito comunicação no atendimento",
      "curso gratuito suporte ao cliente"
    ]
  },
  {
    name: "Administrativo e Financeiro",
    slug: "administrativo-financeiro",
    description:
      "Aponta afinidade com organização, detalhes, processos, planilhas e rotinas que precisam de controle. Pode aproveitar experiências com cobrança, registro de informações e acompanhamento de metas.",
    strengths: ["Organização", "Atenção a detalhes", "Processos", "Cobrança", "Planilhas"],
    attentionPoints: ["Fortalecer Excel ou Google Sheets", "Revisar matemática financeira básica", "Entender rotinas administrativas"],
    suggestedDegrees: ["Administração", "Ciências Contábeis", "Gestão Financeira", "Processos Gerenciais", "Departamento Pessoal"],
    suggestedShortCourses: ["Excel para iniciantes", "Administração básica", "Matemática financeira", "Contas a pagar e receber", "Departamento pessoal"],
    searchKeywords: [
      "curso gratuito administração básica",
      "curso gratuito excel para iniciantes",
      "curso gratuito gestão financeira",
      "curso gratuito departamento pessoal",
      "curso gratuito matemática financeira básica"
    ]
  },
  {
    name: "Marketing e Conteúdo",
    slug: "marketing-conteudo",
    description:
      "Indica interesse por comunicação, escrita, redes sociais, criatividade e entendimento de público. Pode combinar com social media, copywriting, marketing digital e produção de conteúdo.",
    strengths: ["Criatividade", "Comunicação", "Redes sociais", "Escrita", "Estratégia"],
    attentionPoints: ["Criar portfólio simples", "Estudar métricas básicas", "Praticar consistência de produção"],
    suggestedDegrees: ["Marketing", "Publicidade e Propaganda", "Design", "Administração"],
    suggestedShortCourses: ["Marketing digital", "Social Media", "Copywriting", "Canva", "Planejamento de conteúdo"],
    searchKeywords: [
      "curso gratuito marketing digital",
      "curso gratuito social media",
      "curso gratuito copywriting",
      "curso gratuito planejamento de conteúdo",
      "curso gratuito redes sociais para negócios"
    ]
  },
  {
    name: "Tecnologia e Suporte",
    slug: "tecnologia-suporte",
    description:
      "Mostra curiosidade com sistemas, paciência para investigar problemas e disposição para aprender ferramentas. Pode ser uma porta de entrada para suporte técnico, QA, UX ou desenvolvimento.",
    strengths: ["Facilidade com sistemas", "Resolução de problemas", "Lógica", "Paciência", "Aprendizado rápido"],
    attentionPoints: ["Praticar lógica sem pressa", "Montar rotina de estudos", "Aprender fundamentos antes de escolher uma trilha"],
    suggestedDegrees: ["Análise e Desenvolvimento de Sistemas", "Sistemas de Informação", "Gestão de TI", "Administração"],
    suggestedShortCourses: ["Programação para iniciantes", "Suporte técnico", "QA/Testes", "UX básico", "Noções de redes"],
    searchKeywords: [
      "curso gratuito programação para iniciantes",
      "curso gratuito suporte técnico",
      "curso gratuito QA testes",
      "curso gratuito UX iniciante",
      "curso gratuito lógica de programação"
    ]
  },
  {
    name: "Dados e Análise",
    slug: "dados-analise",
    description:
      "Indica afinidade com organização de informação, números, planilhas e busca por padrões. Pode combinar com BI, análise administrativa, indicadores e dados operacionais.",
    strengths: ["Raciocínio lógico", "Organização", "Números", "Planilhas", "Curiosidade analítica"],
    attentionPoints: ["Perder medo de matemática aos poucos", "Praticar Excel com problemas reais", "Estudar SQL e visualização de dados de forma gradual"],
    suggestedDegrees: ["Ciência de Dados", "Administração", "Estatística", "Gestão Financeira", "Sistemas de Informação"],
    suggestedShortCourses: ["Excel", "Power BI", "SQL", "Análise de dados", "Indicadores de negócio"],
    searchKeywords: [
      "curso gratuito power bi iniciante",
      "curso gratuito excel análise de dados",
      "curso gratuito SQL iniciante",
      "curso gratuito BI para iniciantes",
      "curso gratuito análise de dados"
    ]
  },
  {
    name: "Educação e Treinamento",
    slug: "educacao-treinamento",
    description:
      "Mostra afinidade com explicar, orientar e ajudar outras pessoas a aprender. Pode combinar com treinamento corporativo, instrutoria, RH, pedagogia e produção de cursos.",
    strengths: ["Comunicação", "Paciência", "Explicação", "Ajuda a pessoas", "Organização didática"],
    attentionPoints: ["Praticar apresentações curtas", "Aprender a montar aulas simples", "Desenvolver material de apoio claro"],
    suggestedDegrees: ["Pedagogia", "Gestão de RH", "Letras", "Administração"],
    suggestedShortCourses: ["Instrutoria", "Treinamento corporativo", "Design instrucional", "Produção de cursos", "Comunicação didática"],
    searchKeywords: [
      "curso gratuito treinamento corporativo",
      "curso gratuito instrutoria",
      "curso gratuito produção de cursos",
      "curso gratuito pedagogia empresarial",
      "curso gratuito comunicação didática"
    ]
  },
  {
    name: "Recursos Humanos",
    slug: "recursos-humanos",
    description:
      "Aponta interesse por pessoas, escuta, mediação, organização e processos humanos dentro de empresas. Pode combinar com RH, recrutamento, departamento pessoal e clima organizacional.",
    strengths: ["Pessoas", "Escuta", "Organização", "Mediação", "Comunicação"],
    attentionPoints: ["Entender rotinas de DP", "Estudar entrevista e seleção", "Praticar confidencialidade e registro organizado"],
    suggestedDegrees: ["Gestão de RH", "Psicologia", "Administração", "Processos Gerenciais"],
    suggestedShortCourses: ["Recursos humanos", "Recrutamento e seleção", "Departamento pessoal", "Comunicação interpessoal", "Noções de legislação trabalhista"],
    searchKeywords: [
      "curso gratuito recursos humanos",
      "curso gratuito recrutamento e seleção",
      "curso gratuito departamento pessoal",
      "curso gratuito legislação trabalhista básica",
      "curso gratuito gestão de pessoas"
    ]
  },
  {
    name: "Design e Criatividade",
    slug: "design-criatividade",
    description:
      "Indica interesse por estética, comunicação visual, criação e solução de problemas com imagem. Pode combinar com design gráfico, UX/UI, edição de vídeo, Canva e identidade visual.",
    strengths: ["Visual", "Criatividade", "Comunicação", "Estética", "Experimentação"],
    attentionPoints: ["Criar repertório visual", "Aprender fundamentos antes de ferramentas", "Montar portfólio com projetos simples"],
    suggestedDegrees: ["Design Gráfico", "Design Digital", "Publicidade e Propaganda", "Marketing"],
    suggestedShortCourses: ["Canva", "UX/UI", "Edição de vídeo", "Identidade visual", "Design para redes sociais"],
    searchKeywords: [
      "curso gratuito design canva",
      "curso gratuito UX UI iniciante",
      "curso gratuito design gráfico",
      "curso gratuito edição de vídeo",
      "curso gratuito identidade visual"
    ]
  },
  {
    name: "Operações e Processos",
    slug: "operacoes-processos",
    description:
      "Mostra afinidade com rotina, execução, melhoria de processos, organização e cumprimento de combinados. Pode combinar com logística, qualidade, operações e processos administrativos.",
    strengths: ["Organização", "Execução", "Rotina", "Melhoria de processos", "Confiabilidade"],
    attentionPoints: ["Aprender mapeamento simples de processos", "Praticar indicadores de produtividade", "Desenvolver visão de melhoria contínua"],
    suggestedDegrees: ["Logística", "Processos Gerenciais", "Administração", "Gestão da Qualidade"],
    suggestedShortCourses: ["Gestão de processos", "Logística básica", "Qualidade", "Produtividade", "5S e melhoria contínua"],
    searchKeywords: [
      "curso gratuito gestão de processos",
      "curso gratuito logística básica",
      "curso gratuito gestão da qualidade",
      "curso gratuito produtividade",
      "curso gratuito melhoria contínua"
    ]
  }
];

export const courseRecommendations: SeedCourseRecommendation[] = [
  { profileSlug: "comercial-vendas", title: "Atendimento ao Cliente", provider: "Fundação Bradesco", url: "https://www.ev.org.br/", type: "curso", source: "manual", order: 1 },
  { profileSlug: "comercial-vendas", title: "Marketing Digital para sua Empresa", provider: "Sebrae", url: "https://sebrae.com.br/sites/PortalSebrae/cursosonline", type: "curso", source: "manual", order: 2 },
  { profileSlug: "atendimento-sucesso-cliente", title: "Gestão da Experiência do Cliente", provider: "Sebrae", url: "https://sebrae.com.br/sites/PortalSebrae/cursosonline", type: "curso", source: "manual", order: 1 },
  { profileSlug: "atendimento-sucesso-cliente", title: "Comunicação no Atendimento", provider: "Escola Virtual do Governo", url: "https://www.escolavirtual.gov.br/", type: "curso", source: "manual", order: 2 },
  { profileSlug: "administrativo-financeiro", title: "Excel Básico", provider: "Fundação Bradesco", url: "https://www.ev.org.br/", type: "curso", source: "manual", order: 1 },
  { profileSlug: "administrativo-financeiro", title: "Educação Financeira", provider: "Escola Virtual do Governo", url: "https://www.escolavirtual.gov.br/", type: "curso", source: "manual", order: 2 },
  { profileSlug: "marketing-conteudo", title: "Marketing Digital", provider: "Google Ateliê Digital", url: "https://learndigital.withgoogle.com/ateliedigital", type: "curso", source: "manual", order: 1 },
  { profileSlug: "marketing-conteudo", title: "Marketing para Pequenos Negócios", provider: "Sebrae", url: "https://sebrae.com.br/sites/PortalSebrae/cursosonline", type: "curso", source: "manual", order: 2 },
  { profileSlug: "tecnologia-suporte", title: "Fundamentos de programação", provider: "Microsoft Learn", url: "https://learn.microsoft.com/pt-br/training/", type: "trilha", source: "manual", order: 1 },
  { profileSlug: "tecnologia-suporte", title: "Lógica de Programação", provider: "Fundação Bradesco", url: "https://www.ev.org.br/", type: "curso", source: "manual", order: 2 },
  { profileSlug: "dados-analise", title: "Power BI e análise de dados", provider: "Microsoft Learn", url: "https://learn.microsoft.com/pt-br/training/powerplatform/power-bi", type: "trilha", source: "manual", order: 1 },
  { profileSlug: "dados-analise", title: "Excel para análise", provider: "Fundação Bradesco", url: "https://www.ev.org.br/", type: "curso", source: "manual", order: 2 },
  { profileSlug: "educacao-treinamento", title: "Educação e Docência", provider: "Escola Virtual do Governo", url: "https://www.escolavirtual.gov.br/", type: "curso", source: "manual", order: 1 },
  { profileSlug: "educacao-treinamento", title: "Como criar cursos online", provider: "Sebrae", url: "https://sebrae.com.br/sites/PortalSebrae/cursosonline", type: "curso", source: "manual", order: 2 },
  { profileSlug: "recursos-humanos", title: "Gestão de Pessoas", provider: "Sebrae", url: "https://sebrae.com.br/sites/PortalSebrae/cursosonline", type: "curso", source: "manual", order: 1 },
  { profileSlug: "recursos-humanos", title: "Noções de Departamento Pessoal", provider: "Fundação Bradesco", url: "https://www.ev.org.br/", type: "curso", source: "manual", order: 2 },
  { profileSlug: "design-criatividade", title: "Design para redes sociais", provider: "Canva Design School", url: "https://www.canva.com/pt_br/aprenda/", type: "curso", source: "manual", order: 1 },
  { profileSlug: "design-criatividade", title: "UX Design", provider: "Coursera", url: "https://www.coursera.org/search?query=ux%20design&language=Portuguese", type: "curso auditavel", source: "manual", order: 2 },
  { profileSlug: "operacoes-processos", title: "Gestão de Processos", provider: "Escola Virtual do Governo", url: "https://www.escolavirtual.gov.br/", type: "curso", source: "manual", order: 1 },
  { profileSlug: "operacoes-processos", title: "Logística para negócios", provider: "Sebrae", url: "https://sebrae.com.br/sites/PortalSebrae/cursosonline", type: "curso", source: "manual", order: 2 }
];
