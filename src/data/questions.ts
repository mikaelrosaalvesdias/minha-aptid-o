import type { ProfileSlug } from "./profiles";

export type SeedQuestion = {
  slug: string;
  text: string;
  category: "Interesses" | "Habilidades percebidas" | "Experiências anteriores" | "Preferência de rotina" | "Objetivos";
  type: "scale";
  order: number;
  tags: string[];
  weights: Partial<Record<ProfileSlug, number>>;
};

export const aptitudeQuestions: SeedQuestion[] = [
  {
    slug: "interesse-pessoas-problemas",
    text: "Gosto de conversar com pessoas e entender seus problemas.",
    category: "Interesses",
    type: "scale",
    order: 1,
    tags: ["pessoas", "comunicação", "escuta"],
    weights: { "atendimento-sucesso-cliente": 3, "comercial-vendas": 2, "recursos-humanos": 2, "educacao-treinamento": 1 }
  },
  {
    slug: "interesse-tecnologia-sistemas",
    text: "Tenho curiosidade por tecnologia, sistemas, aplicativos e ferramentas digitais.",
    category: "Interesses",
    type: "scale",
    order: 2,
    tags: ["tecnologia", "sistemas", "aprendizado"],
    weights: { "tecnologia-suporte": 3, "dados-analise": 2, "design-criatividade": 1, "marketing-conteudo": 1 }
  },
  {
    slug: "interesse-organizacao-controle",
    text: "Gosto de organizar informações, conferir tarefas e manter tudo sob controle.",
    category: "Interesses",
    type: "scale",
    order: 3,
    tags: ["organização", "controle", "detalhes"],
    weights: { "administrativo-financeiro": 3, "operacoes-processos": 3, "recursos-humanos": 1, "dados-analise": 2 }
  },
  {
    slug: "interesse-criatividade-conteudo",
    text: "Sinto vontade de criar textos, posts, ideias, campanhas ou conteúdos para redes sociais.",
    category: "Interesses",
    type: "scale",
    order: 4,
    tags: ["criatividade", "conteúdo", "redes sociais"],
    weights: { "marketing-conteudo": 3, "design-criatividade": 2, "educacao-treinamento": 1, "comercial-vendas": 1 }
  },
  {
    slug: "interesse-numeros-planilhas",
    text: "Tenho interesse em trabalhar com números, planilhas, indicadores ou comparações.",
    category: "Interesses",
    type: "scale",
    order: 5,
    tags: ["números", "planilhas", "indicadores"],
    weights: { "dados-analise": 3, "administrativo-financeiro": 3, "operacoes-processos": 1, "tecnologia-suporte": 1 }
  },
  {
    slug: "interesse-comunicacao-argumentacao",
    text: "Gosto de explicar ideias, argumentar e adaptar minha fala para diferentes pessoas.",
    category: "Interesses",
    type: "scale",
    order: 6,
    tags: ["comunicação", "argumentação", "clareza"],
    weights: { "comercial-vendas": 3, "atendimento-sucesso-cliente": 2, "marketing-conteudo": 2, "educacao-treinamento": 2, "recursos-humanos": 1 }
  },
  {
    slug: "interesse-ensinar-ajudar",
    text: "Gosto de ensinar, orientar ou ajudar alguém a entender algo passo a passo.",
    category: "Interesses",
    type: "scale",
    order: 7,
    tags: ["ensino", "paciência", "orientação"],
    weights: { "educacao-treinamento": 3, "recursos-humanos": 2, "atendimento-sucesso-cliente": 2, "tecnologia-suporte": 1 }
  },
  {
    slug: "interesse-vendas-metas",
    text: "Me interesso por vendas, metas, comissões, negociação ou crescimento de resultados.",
    category: "Interesses",
    type: "scale",
    order: 8,
    tags: ["vendas", "metas", "negociação"],
    weights: { "comercial-vendas": 4, "marketing-conteudo": 1, "atendimento-sucesso-cliente": 1 }
  },
  {
    slug: "interesse-processos-rotina",
    text: "Tenho interesse em melhorar processos, organizar rotinas e encontrar formas mais eficientes de trabalhar.",
    category: "Interesses",
    type: "scale",
    order: 9,
    tags: ["processos", "rotina", "melhoria"],
    weights: { "operacoes-processos": 4, "administrativo-financeiro": 2, "dados-analise": 2, "tecnologia-suporte": 1 }
  },
  {
    slug: "interesse-design-visual",
    text: "Presto atenção em estética, imagens, cores, layouts ou apresentação visual.",
    category: "Interesses",
    type: "scale",
    order: 10,
    tags: ["visual", "estética", "design"],
    weights: { "design-criatividade": 4, "marketing-conteudo": 2, "tecnologia-suporte": 1 }
  },
  {
    slug: "habilidade-comunicacao-pressao",
    text: "Consigo me comunicar mesmo quando a conversa está difícil ou sob pressão.",
    category: "Habilidades percebidas",
    type: "scale",
    order: 11,
    tags: ["comunicação sob pressão", "resiliência", "atendimento"],
    weights: { "atendimento-sucesso-cliente": 3, "comercial-vendas": 3, "recursos-humanos": 1, "operacoes-processos": 1 }
  },
  {
    slug: "habilidade-paciencia",
    text: "Tenho paciência para lidar com dúvidas, reclamações ou pessoas irritadas.",
    category: "Habilidades percebidas",
    type: "scale",
    order: 12,
    tags: ["paciência", "escuta", "controle emocional"],
    weights: { "atendimento-sucesso-cliente": 4, "educacao-treinamento": 3, "recursos-humanos": 2, "tecnologia-suporte": 2 }
  },
  {
    slug: "habilidade-organizacao",
    text: "Sou uma pessoa organizada com tarefas, prazos, anotações e prioridades.",
    category: "Habilidades percebidas",
    type: "scale",
    order: 13,
    tags: ["organização", "prazos", "prioridades"],
    weights: { "administrativo-financeiro": 3, "operacoes-processos": 3, "recursos-humanos": 2, "dados-analise": 2 }
  },
  {
    slug: "habilidade-raciocinio-logico",
    text: "Tenho facilidade para seguir raciocínios lógicos e resolver problemas em etapas.",
    category: "Habilidades percebidas",
    type: "scale",
    order: 14,
    tags: ["lógica", "problemas", "método"],
    weights: { "tecnologia-suporte": 3, "dados-analise": 3, "operacoes-processos": 2, "administrativo-financeiro": 1 }
  },
  {
    slug: "habilidade-escrita",
    text: "Consigo escrever mensagens claras, educadas e objetivas.",
    category: "Habilidades percebidas",
    type: "scale",
    order: 15,
    tags: ["escrita", "clareza", "comunicação"],
    weights: { "marketing-conteudo": 3, "atendimento-sucesso-cliente": 2, "educacao-treinamento": 2, "recursos-humanos": 1, "comercial-vendas": 1 }
  },
  {
    slug: "habilidade-matematica-basica",
    text: "Consigo lidar com matemática básica, porcentagem, valores e comparações simples.",
    category: "Habilidades percebidas",
    type: "scale",
    order: 16,
    tags: ["matemática básica", "porcentagem", "valores"],
    weights: { "administrativo-financeiro": 3, "dados-analise": 3, "comercial-vendas": 1, "operacoes-processos": 1 }
  },
  {
    slug: "habilidade-negociacao",
    text: "Tenho facilidade para negociar, contornar objeções e buscar acordos.",
    category: "Habilidades percebidas",
    type: "scale",
    order: 17,
    tags: ["negociação", "objeções", "acordo"],
    weights: { "comercial-vendas": 4, "atendimento-sucesso-cliente": 2, "recursos-humanos": 1, "administrativo-financeiro": 1 }
  },
  {
    slug: "habilidade-empatia",
    text: "Costumo perceber o lado da outra pessoa antes de responder.",
    category: "Habilidades percebidas",
    type: "scale",
    order: 18,
    tags: ["empatia", "escuta", "pessoas"],
    weights: { "atendimento-sucesso-cliente": 3, "recursos-humanos": 3, "educacao-treinamento": 2, "comercial-vendas": 1 }
  },
  {
    slug: "habilidade-criatividade",
    text: "Tenho facilidade para pensar em ideias diferentes quando surge um desafio.",
    category: "Habilidades percebidas",
    type: "scale",
    order: 19,
    tags: ["criatividade", "ideias", "solução"],
    weights: { "marketing-conteudo": 3, "design-criatividade": 3, "educacao-treinamento": 1, "tecnologia-suporte": 1 }
  },
  {
    slug: "habilidade-atencao-detalhes",
    text: "Percebo erros, inconsistências ou detalhes que outras pessoas deixam passar.",
    category: "Habilidades percebidas",
    type: "scale",
    order: 20,
    tags: ["atenção a detalhes", "conferência", "qualidade"],
    weights: { "administrativo-financeiro": 3, "dados-analise": 3, "operacoes-processos": 3, "tecnologia-suporte": 2 }
  },
  {
    slug: "experiencia-atendimento",
    text: "Já tive experiência atendendo clientes, usuários ou público em geral.",
    category: "Experiências anteriores",
    type: "scale",
    order: 21,
    tags: ["atendimento", "cliente", "público"],
    weights: { "atendimento-sucesso-cliente": 4, "comercial-vendas": 2, "recursos-humanos": 1, "educacao-treinamento": 1 }
  },
  {
    slug: "experiencia-vendas",
    text: "Já trabalhei ou ajudei com vendas, oferta de produtos ou fechamento de acordos.",
    category: "Experiências anteriores",
    type: "scale",
    order: 22,
    tags: ["vendas", "oferta", "fechamento"],
    weights: { "comercial-vendas": 4, "marketing-conteudo": 1, "atendimento-sucesso-cliente": 1 }
  },
  {
    slug: "experiencia-cobranca",
    text: "Já trabalhei com cobrança, negociação de dívidas ou recuperação de valores.",
    category: "Experiências anteriores",
    type: "scale",
    order: 23,
    tags: ["cobrança", "negociação", "valores"],
    weights: { "administrativo-financeiro": 3, "comercial-vendas": 3, "atendimento-sucesso-cliente": 2, "operacoes-processos": 1 }
  },
  {
    slug: "experiencia-administracao",
    text: "Já organizei documentos, cadastros, relatórios, agendas ou rotinas administrativas.",
    category: "Experiências anteriores",
    type: "scale",
    order: 24,
    tags: ["administração", "documentos", "cadastros"],
    weights: { "administrativo-financeiro": 4, "operacoes-processos": 2, "recursos-humanos": 1, "dados-analise": 1 }
  },
  {
    slug: "experiencia-redes-sociais",
    text: "Já criei posts, cuidei de redes sociais ou pensei em conteúdo para divulgar algo.",
    category: "Experiências anteriores",
    type: "scale",
    order: 25,
    tags: ["redes sociais", "conteúdo", "divulgação"],
    weights: { "marketing-conteudo": 4, "design-criatividade": 2, "comercial-vendas": 1 }
  },
  {
    slug: "experiencia-planilhas",
    text: "Já usei planilhas para organizar listas, valores, tarefas ou resultados.",
    category: "Experiências anteriores",
    type: "scale",
    order: 26,
    tags: ["planilhas", "listas", "resultados"],
    weights: { "administrativo-financeiro": 3, "dados-analise": 3, "operacoes-processos": 2 }
  },
  {
    slug: "experiencia-tecnologia",
    text: "Já ajudei alguém a usar um sistema, resolver erro simples ou entender uma ferramenta digital.",
    category: "Experiências anteriores",
    type: "scale",
    order: 27,
    tags: ["suporte", "sistemas", "ferramentas"],
    weights: { "tecnologia-suporte": 4, "atendimento-sucesso-cliente": 2, "educacao-treinamento": 1 }
  },
  {
    slug: "experiencia-ensino",
    text: "Já ensinei algo para alguém, treinei uma pessoa ou expliquei uma tarefa com calma.",
    category: "Experiências anteriores",
    type: "scale",
    order: 28,
    tags: ["ensino", "treinamento", "explicação"],
    weights: { "educacao-treinamento": 4, "recursos-humanos": 2, "atendimento-sucesso-cliente": 1, "tecnologia-suporte": 1 }
  },
  {
    slug: "experiencia-cuidado-pessoas",
    text: "Já cuidei, orientei ou dei suporte emocional/prático para pessoas em situações difíceis.",
    category: "Experiências anteriores",
    type: "scale",
    order: 29,
    tags: ["cuidado", "suporte", "pessoas"],
    weights: { "recursos-humanos": 3, "atendimento-sucesso-cliente": 3, "educacao-treinamento": 2 }
  },
  {
    slug: "experiencia-processos",
    text: "Já organizei um passo a passo ou melhorei a forma de executar uma tarefa repetitiva.",
    category: "Experiências anteriores",
    type: "scale",
    order: 30,
    tags: ["processos", "passo a passo", "melhoria"],
    weights: { "operacoes-processos": 4, "administrativo-financeiro": 2, "tecnologia-suporte": 1, "dados-analise": 1 }
  },
  {
    slug: "rotina-pessoas",
    text: "Prefiro uma rotina com contato frequente com pessoas.",
    category: "Preferência de rotina",
    type: "scale",
    order: 31,
    tags: ["pessoas", "contato", "rotina"],
    weights: { "atendimento-sucesso-cliente": 3, "comercial-vendas": 3, "recursos-humanos": 2, "educacao-treinamento": 2 }
  },
  {
    slug: "rotina-sozinha",
    text: "Também me vejo trabalhando sozinha por períodos, com foco e autonomia.",
    category: "Preferência de rotina",
    type: "scale",
    order: 32,
    tags: ["autonomia", "foco", "concentração"],
    weights: { "dados-analise": 2, "tecnologia-suporte": 2, "design-criatividade": 2, "administrativo-financeiro": 1, "operacoes-processos": 1 }
  },
  {
    slug: "rotina-resolver-problemas",
    text: "Gosto de resolver problemas e descobrir o que está causando uma dificuldade.",
    category: "Preferência de rotina",
    type: "scale",
    order: 33,
    tags: ["resolução de problemas", "investigação", "causa"],
    weights: { "tecnologia-suporte": 3, "dados-analise": 3, "atendimento-sucesso-cliente": 2, "operacoes-processos": 2 }
  },
  {
    slug: "rotina-criar-conteudo",
    text: "Prefiro atividades em que eu possa criar conteúdo, ideias, materiais ou apresentações.",
    category: "Preferência de rotina",
    type: "scale",
    order: 34,
    tags: ["conteúdo", "ideias", "apresentação"],
    weights: { "marketing-conteudo": 3, "design-criatividade": 3, "educacao-treinamento": 2 }
  },
  {
    slug: "rotina-analisar-informacoes",
    text: "Gosto de analisar informações antes de tomar uma decisão.",
    category: "Preferência de rotina",
    type: "scale",
    order: 35,
    tags: ["análise", "decisão", "informação"],
    weights: { "dados-analise": 4, "administrativo-financeiro": 2, "operacoes-processos": 2, "tecnologia-suporte": 1 }
  },
  {
    slug: "rotina-seguir-processos",
    text: "Trabalho bem quando existe processo claro, sequência e padrão de qualidade.",
    category: "Preferência de rotina",
    type: "scale",
    order: 36,
    tags: ["processos", "qualidade", "sequência"],
    weights: { "operacoes-processos": 4, "administrativo-financeiro": 3, "tecnologia-suporte": 1, "recursos-humanos": 1 }
  },
  {
    slug: "rotina-metas",
    text: "Me sinto estimulada quando tenho metas claras e acompanho meu progresso.",
    category: "Preferência de rotina",
    type: "scale",
    order: 37,
    tags: ["metas", "progresso", "resultado"],
    weights: { "comercial-vendas": 4, "operacoes-processos": 2, "administrativo-financeiro": 1, "marketing-conteudo": 1 }
  },
  {
    slug: "rotina-previsivel",
    text: "Prefiro uma rotina mais previsível do que um dia a dia muito incerto.",
    category: "Preferência de rotina",
    type: "scale",
    order: 38,
    tags: ["previsibilidade", "rotina", "estabilidade"],
    weights: { "administrativo-financeiro": 3, "operacoes-processos": 3, "recursos-humanos": 1 }
  },
  {
    slug: "rotina-liberdade-criativa",
    text: "Tenho vontade de ter liberdade criativa para testar formatos e ideias.",
    category: "Preferência de rotina",
    type: "scale",
    order: 39,
    tags: ["liberdade criativa", "experimentação", "formatos"],
    weights: { "marketing-conteudo": 3, "design-criatividade": 4, "educacao-treinamento": 1 }
  },
  {
    slug: "rotina-home-office",
    text: "Tenho interesse em trabalhos que possam ser feitos em home office ou modelo híbrido.",
    category: "Preferência de rotina",
    type: "scale",
    order: 40,
    tags: ["home office", "autonomia", "digital"],
    weights: { "tecnologia-suporte": 2, "dados-analise": 2, "marketing-conteudo": 2, "design-criatividade": 2, "atendimento-sucesso-cliente": 1 }
  },
  {
    slug: "objetivo-faculdade",
    text: "Quero considerar uma faculdade ou graduação tecnológica como caminho possível.",
    category: "Objetivos",
    type: "scale",
    order: 41,
    tags: ["faculdade", "graduação", "formação"],
    weights: { "administrativo-financeiro": 1, "dados-analise": 1, "tecnologia-suporte": 1, "recursos-humanos": 1, "educacao-treinamento": 1 }
  },
  {
    slug: "objetivo-curso-rapido",
    text: "Quero começar por cursos rápidos para testar áreas antes de decidir.",
    category: "Objetivos",
    type: "scale",
    order: 42,
    tags: ["curso rápido", "teste prático", "exploração"],
    weights: { "marketing-conteudo": 1, "design-criatividade": 1, "tecnologia-suporte": 1, "comercial-vendas": 1, "operacoes-processos": 1 }
  },
  {
    slug: "objetivo-mercado-rapido",
    text: "Tenho vontade de entrar ou recolocar no mercado o quanto antes.",
    category: "Objetivos",
    type: "scale",
    order: 43,
    tags: ["mercado", "empregabilidade", "curto prazo"],
    weights: { "comercial-vendas": 2, "atendimento-sucesso-cliente": 2, "administrativo-financeiro": 2, "operacoes-processos": 1, "tecnologia-suporte": 1 }
  },
  {
    slug: "objetivo-remoto",
    text: "Trabalhar remoto ou com mais flexibilidade é importante para mim.",
    category: "Objetivos",
    type: "scale",
    order: 44,
    tags: ["remoto", "flexibilidade", "digital"],
    weights: { "tecnologia-suporte": 2, "dados-analise": 2, "marketing-conteudo": 2, "design-criatividade": 2 }
  },
  {
    slug: "objetivo-empreender",
    text: "Tenho curiosidade ou vontade de empreender, vender serviços ou criar algo próprio.",
    category: "Objetivos",
    type: "scale",
    order: 45,
    tags: ["empreender", "serviços", "autonomia"],
    weights: { "comercial-vendas": 3, "marketing-conteudo": 2, "design-criatividade": 2, "administrativo-financeiro": 1 }
  },
  {
    slug: "objetivo-crescer-empresa",
    text: "Quero crescer dentro de uma empresa e assumir mais responsabilidades com o tempo.",
    category: "Objetivos",
    type: "scale",
    order: 46,
    tags: ["crescimento", "empresa", "responsabilidade"],
    weights: { "operacoes-processos": 2, "administrativo-financeiro": 2, "recursos-humanos": 2, "comercial-vendas": 2, "atendimento-sucesso-cliente": 1 }
  },
  {
    slug: "objetivo-melhorar-renda",
    text: "Melhorar minha renda é uma prioridade na escolha do próximo caminho.",
    category: "Objetivos",
    type: "scale",
    order: 47,
    tags: ["renda", "prioridade", "crescimento"],
    weights: { "comercial-vendas": 2, "tecnologia-suporte": 2, "dados-analise": 2, "administrativo-financeiro": 1 }
  },
  {
    slug: "objetivo-mudar-area",
    text: "Tenho vontade de mudar de área, mas prefiro aproveitar algo que já sei fazer.",
    category: "Objetivos",
    type: "scale",
    order: 48,
    tags: ["transição", "experiência", "aproveitamento"],
    weights: { "atendimento-sucesso-cliente": 2, "comercial-vendas": 2, "administrativo-financeiro": 2, "recursos-humanos": 1, "tecnologia-suporte": 1 }
  },
  {
    slug: "objetivo-facilidade-computador",
    text: "Tenho facilidade ou disposição para aprender ferramentas no computador.",
    category: "Objetivos",
    type: "scale",
    order: 49,
    tags: ["computador", "ferramentas", "aprendizado"],
    weights: { "tecnologia-suporte": 3, "dados-analise": 3, "administrativo-financeiro": 2, "marketing-conteudo": 1, "design-criatividade": 1 }
  },
  {
    slug: "objetivo-facilidade-pessoas",
    text: "Tenho facilidade para lidar com pessoas e criar uma conversa respeitosa.",
    category: "Objetivos",
    type: "scale",
    order: 50,
    tags: ["pessoas", "respeito", "conversa"],
    weights: { "atendimento-sucesso-cliente": 3, "comercial-vendas": 2, "recursos-humanos": 3, "educacao-treinamento": 2 }
  }
];
