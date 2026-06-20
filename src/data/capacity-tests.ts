import type { ProfileSlug } from "./profiles";

export type CapacityOption = {
  key: string;
  label: string;
};

export type SeedCapacityQuestion = {
  text: string;
  options: CapacityOption[];
  correctAnswer: string;
  explanation: string;
  order: number;
};

export type SeedCapacityTest = {
  slug: string;
  title: string;
  description: string;
  relatedProfiles: ProfileSlug[];
  studyTips: string[];
  order: number;
  questions: SeedCapacityQuestion[];
};

const abc = (a: string, b: string, c: string, d: string): CapacityOption[] => [
  { key: "A", label: a },
  { key: "B", label: b },
  { key: "C", label: c },
  { key: "D", label: d }
];

export const capacityTests: SeedCapacityTest[] = [
  {
    slug: "comunicacao",
    title: "Comunicação",
    description: "Avalia clareza, tom e escolha de resposta em situações profissionais.",
    relatedProfiles: ["atendimento-sucesso-cliente", "comercial-vendas", "recursos-humanos", "educacao-treinamento", "marketing-conteudo"],
    studyTips: ["Comunicação assertiva", "Escuta ativa", "Escrita objetiva", "Atendimento ao cliente"],
    order: 1,
    questions: [
      {
        text: "Um cliente escreve irritado: 'Ninguém resolve meu problema'. Qual resposta abre melhor a conversa?",
        options: abc("Isso não é comigo.", "Entendo sua frustração. Vou verificar o que aconteceu e te orientar nos próximos passos.", "Você precisa aguardar.", "Leia as regras antes de reclamar."),
        correctAnswer: "B",
        explanation: "A melhor resposta reconhece a emoção, assume encaminhamento e evita confronto.",
        order: 1
      },
      {
        text: "Qual frase é mais objetiva em um e-mail profissional?",
        options: abc("Venho por meio desta solicitar, se possível...", "Oi, faz aquilo lá.", "Solicito o envio do documento até sexta-feira para concluirmos o cadastro.", "Não esquece."),
        correctAnswer: "C",
        explanation: "Ela informa ação, prazo e motivo com clareza.",
        order: 2
      },
      {
        text: "Durante uma negociação, a pessoa diz que não pode pagar hoje. O melhor próximo passo é:",
        options: abc("Encerrar a ligação.", "Aumentar o tom de voz.", "Perguntar qual data ou condição seria viável e registrar a proposta.", "Dizer que ela não quer resolver."),
        correctAnswer: "C",
        explanation: "Negociação profissional busca alternativa concreta e registrável.",
        order: 3
      },
      {
        text: "Ao explicar uma tarefa para alguém novo, o mais útil é:",
        options: abc("Falar tudo rapidamente.", "Dividir em passos e confirmar se a pessoa entendeu.", "Mandar pesquisar sozinha.", "Usar apenas termos técnicos."),
        correctAnswer: "B",
        explanation: "Passos e checagem reduzem ruído e retrabalho.",
        order: 4
      },
      {
        text: "Qual atitude melhora uma conversa difícil?",
        options: abc("Responder antes de ouvir tudo.", "Repetir o ponto principal para confirmar entendimento.", "Ignorar detalhes.", "Focar em culpados."),
        correctAnswer: "B",
        explanation: "Confirmar entendimento evita interpretação errada e mostra escuta.",
        order: 5
      }
    ]
  },
  {
    slug: "interpretacao-texto",
    title: "Interpretação de texto",
    description: "Testa leitura atenta, identificação de informação e inferência simples.",
    relatedProfiles: ["marketing-conteudo", "educacao-treinamento", "recursos-humanos", "atendimento-sucesso-cliente", "administrativo-financeiro"],
    studyTips: ["Leitura ativa", "Resumo de textos curtos", "Identificação de objetivo da mensagem"],
    order: 2,
    questions: [
      {
        text: "Mensagem: 'O cadastro está pendente porque falta comprovante de endereço'. O problema principal é:",
        options: abc("Falta de pagamento", "Documento ausente", "Erro no nome", "Sistema fora do ar"),
        correctAnswer: "B",
        explanation: "A pendência citada é a ausência do comprovante de endereço.",
        order: 1
      },
      {
        text: "Se uma instrução diz 'envie até 18h', significa que:",
        options: abc("Pode enviar amanhã", "Deve enviar antes ou no máximo às 18h", "Só pode enviar depois das 18h", "Não precisa enviar"),
        correctAnswer: "B",
        explanation: "A expressão define prazo-limite.",
        order: 2
      },
      {
        text: "Em 'apesar do atraso, o atendimento foi resolutivo', a ideia principal é:",
        options: abc("O atendimento não aconteceu", "Houve atraso, mas o problema foi resolvido", "O atraso foi ignorado", "Nada foi resolvido"),
        correctAnswer: "B",
        explanation: "A palavra 'apesar' contrapõe atraso e resolução.",
        order: 3
      },
      {
        text: "Qual dado é essencial em um recado de retorno ao cliente?",
        options: abc("Cor favorita", "Nome, motivo do contato e prazo de retorno", "Opinião pessoal", "Assunto sem contexto"),
        correctAnswer: "B",
        explanation: "Esses dados permitem continuidade no atendimento.",
        order: 4
      },
      {
        text: "Um comunicado diz: 'A atualização é opcional'. Isso quer dizer que:",
        options: abc("É obrigatória", "É proibida", "Pode ser feita, mas não é exigida", "Já foi feita automaticamente"),
        correctAnswer: "C",
        explanation: "Opcional significa escolha, não obrigação.",
        order: 5
      }
    ]
  },
  {
    slug: "raciocinio-logico",
    title: "Raciocínio lógico",
    description: "Avalia sequência, causa e solução de problemas em etapas.",
    relatedProfiles: ["tecnologia-suporte", "dados-analise", "operacoes-processos", "administrativo-financeiro"],
    studyTips: ["Lógica de programação", "Problemas de sequência", "Mapeamento de causa e efeito"],
    order: 3,
    questions: [
      {
        text: "Sequência: 2, 4, 8, 16. Próximo número:",
        options: abc("18", "24", "32", "64"),
        correctAnswer: "C",
        explanation: "Cada número dobra em relação ao anterior.",
        order: 1
      },
      {
        text: "Se todo cadastro aprovado tem documento válido, e este cadastro não tem documento válido, então:",
        options: abc("Está aprovado", "Não pode ser considerado aprovado por essa regra", "Não precisa de análise", "Sempre será rejeitado sem olhar nada"),
        correctAnswer: "B",
        explanation: "A regra exige documento válido para aprovação.",
        order: 2
      },
      {
        text: "Um sistema falha apenas quando a internet cai. Se a internet está normal, a primeira hipótese deve ser:",
        options: abc("Culpar a internet", "Investigar outra causa", "Desligar tudo sem testar", "Ignorar o problema"),
        correctAnswer: "B",
        explanation: "Se a condição conhecida não ocorreu, é preciso testar outras causas.",
        order: 3
      },
      {
        text: "Para resolver um problema complexo, a melhor abordagem inicial é:",
        options: abc("Tentar tudo ao mesmo tempo", "Quebrar o problema em partes menores", "Esperar desaparecer", "Pular etapas"),
        correctAnswer: "B",
        explanation: "Dividir em partes torna a investigação controlável.",
        order: 4
      },
      {
        text: "Se A acontece antes de B, e B antes de C, a ordem correta é:",
        options: abc("C, B, A", "B, A, C", "A, B, C", "A, C, B"),
        correctAnswer: "C",
        explanation: "A relação dada define a sequência A, B e C.",
        order: 5
      }
    ]
  },
  {
    slug: "matematica-basica",
    title: "Matemática básica",
    description: "Mede porcentagem, valores simples e comparação numérica.",
    relatedProfiles: ["administrativo-financeiro", "dados-analise", "comercial-vendas", "operacoes-processos"],
    studyTips: ["Porcentagem", "Regra de três simples", "Matemática financeira básica", "Excel básico"],
    order: 4,
    questions: [
      {
        text: "10% de R$ 200,00 é:",
        options: abc("R$ 2,00", "R$ 10,00", "R$ 20,00", "R$ 40,00"),
        correctAnswer: "C",
        explanation: "10% de 200 é 20.",
        order: 1
      },
      {
        text: "Um produto de R$ 100,00 com desconto de 15% fica:",
        options: abc("R$ 115,00", "R$ 95,00", "R$ 85,00", "R$ 75,00"),
        correctAnswer: "C",
        explanation: "15% de 100 é 15; 100 - 15 = 85.",
        order: 2
      },
      {
        text: "Se uma meta é 50 contatos e já foram feitos 35, faltam:",
        options: abc("10", "15", "20", "25"),
        correctAnswer: "B",
        explanation: "50 - 35 = 15.",
        order: 3
      },
      {
        text: "Qual valor é maior?",
        options: abc("0,25", "25%", "1/5", "0,3"),
        correctAnswer: "D",
        explanation: "0,3 equivale a 30%, maior que 25% e 20%.",
        order: 4
      },
      {
        text: "R$ 60,00 divididos em 3 partes iguais resultam em:",
        options: abc("R$ 15,00", "R$ 20,00", "R$ 30,00", "R$ 180,00"),
        correctAnswer: "B",
        explanation: "60 dividido por 3 é 20.",
        order: 5
      }
    ]
  },
  {
    slug: "atencao-detalhes",
    title: "Atenção a detalhes",
    description: "Avalia conferência, consistência e cuidado com dados.",
    relatedProfiles: ["administrativo-financeiro", "dados-analise", "operacoes-processos", "tecnologia-suporte"],
    studyTips: ["Conferência de dados", "Checklists", "Excel básico", "Qualidade"],
    order: 5,
    questions: [
      {
        text: "Qual item está diferente? BR-2048, BR-2048, BR-2408, BR-2048",
        options: abc("Primeiro", "Segundo", "Terceiro", "Quarto"),
        correctAnswer: "C",
        explanation: "O terceiro troca a ordem dos números: 2408.",
        order: 1
      },
      {
        text: "Em uma lista, um e-mail aparece como maria@@email.com. O erro é:",
        options: abc("Falta ponto", "Há dois sinais @", "Não tem nome", "Está correto"),
        correctAnswer: "B",
        explanation: "Endereços de e-mail usam apenas um @.",
        order: 2
      },
      {
        text: "Pedido: 12 unidades. Nota: 10 unidades. O que fazer?",
        options: abc("Aprovar sem conferir", "Registrar divergência antes de concluir", "Alterar o pedido sem avisar", "Ignorar por ser pouca diferença"),
        correctAnswer: "B",
        explanation: "Diferenças devem ser registradas antes de finalizar.",
        order: 3
      },
      {
        text: "Qual sequência tem todos os itens em ordem crescente?",
        options: abc("1, 3, 2, 4", "2, 3, 4, 5", "5, 4, 3, 2", "2, 2, 1, 3"),
        correctAnswer: "B",
        explanation: "A opção B cresce de 2 até 5.",
        order: 4
      },
      {
        text: "Ao revisar um cadastro, o mais importante é:",
        options: abc("Conferir campos obrigatórios e consistência", "Olhar apenas o primeiro campo", "Adivinhar dados faltantes", "Apagar informações antigas sem motivo"),
        correctAnswer: "A",
        explanation: "Conferência completa reduz erro operacional.",
        order: 5
      }
    ]
  },
  {
    slug: "organizacao",
    title: "Organização",
    description: "Mede priorização, planejamento e uso de processos simples.",
    relatedProfiles: ["administrativo-financeiro", "operacoes-processos", "recursos-humanos", "educacao-treinamento"],
    studyTips: ["Gestão de tarefas", "Kanban simples", "Rotina administrativa", "Priorização"],
    order: 6,
    questions: [
      {
        text: "Você recebe 8 tarefas para hoje. O melhor primeiro passo é:",
        options: abc("Começar pela mais fácil sem olhar prazo", "Listar prazos e impacto de cada tarefa", "Esperar alguém cobrar", "Fazer tudo ao mesmo tempo"),
        correctAnswer: "B",
        explanation: "Prazo e impacto ajudam a priorizar.",
        order: 1
      },
      {
        text: "Uma tarefa recorrente costuma ser esquecida. O que ajuda mais?",
        options: abc("Criar lembrete ou checklist", "Confiar só na memória", "Deixar para o fim do mês", "Trocar de tarefa"),
        correctAnswer: "A",
        explanation: "Checklists reduzem dependência da memória.",
        order: 2
      },
      {
        text: "Qual informação deve estar em um controle de acompanhamento?",
        options: abc("Responsável, prazo e status", "Apenas cor da linha", "Só o nome da tarefa", "Uma observação vaga"),
        correctAnswer: "A",
        explanation: "Esses dados permitem saber quem faz, até quando e em que situação está.",
        order: 3
      },
      {
        text: "Quando uma rotina dá erro com frequência, uma boa ação é:",
        options: abc("Culpar a pessoa sempre", "Mapear o passo em que o erro acontece", "Parar de registrar", "Fazer mais rápido"),
        correctAnswer: "B",
        explanation: "Mapear o ponto de falha permite melhorar o processo.",
        order: 4
      },
      {
        text: "Para organizar estudos de 30 dias, o mais adequado é:",
        options: abc("Definir um tema por semana e tarefas pequenas", "Estudar tudo em um único dia", "Não escolher tema", "Mudar de assunto a cada hora"),
        correctAnswer: "A",
        explanation: "Divisão semanal torna o plano viável.",
        order: 5
      }
    ]
  },
  {
    slug: "criatividade",
    title: "Criatividade",
    description: "Observa geração de alternativas, adaptação e comunicação visual/textual.",
    relatedProfiles: ["marketing-conteudo", "design-criatividade", "educacao-treinamento", "comercial-vendas"],
    studyTips: ["Canva", "Repertório visual", "Copywriting", "Brainstorming estruturado"],
    order: 7,
    questions: [
      {
        text: "Você precisa divulgar um curso gratuito. Qual primeira ação ajuda na criação?",
        options: abc("Entender para quem é o curso", "Escolher cores aleatórias", "Copiar qualquer texto", "Postar sem revisar"),
        correctAnswer: "A",
        explanation: "Criatividade útil começa entendendo público e objetivo.",
        order: 1
      },
      {
        text: "Uma ideia não funcionou. A melhor postura é:",
        options: abc("Nunca mais testar", "Observar o resultado e criar uma variação", "Apagar tudo", "Culpar o público"),
        correctAnswer: "B",
        explanation: "Criatividade profissional envolve teste e ajuste.",
        order: 2
      },
      {
        text: "Qual título é mais claro para um post sobre Excel básico?",
        options: abc("Coisas legais", "Excel básico: 5 funções para organizar sua rotina", "Hoje sim", "Planilhas e afins"),
        correctAnswer: "B",
        explanation: "Ele mostra tema, nível e benefício.",
        order: 3
      },
      {
        text: "Ao criar um material visual, é melhor:",
        options: abc("Usar todas as fontes possíveis", "Manter hierarquia, contraste e leitura fácil", "Colocar texto minúsculo", "Ignorar espaçamento"),
        correctAnswer: "B",
        explanation: "Boa criação visual facilita entendimento.",
        order: 4
      },
      {
        text: "Para gerar ideias sem travar, uma técnica útil é:",
        options: abc("Escrever várias opções antes de julgar", "Esperar a ideia perfeita", "Evitar referências", "Desistir no primeiro bloqueio"),
        correctAnswer: "A",
        explanation: "Separar geração e avaliação aumenta repertório.",
        order: 5
      }
    ]
  },
  {
    slug: "resolucao-problemas",
    title: "Resolução de problemas",
    description: "Avalia diagnóstico, escolha de ação e aprendizado com situações reais.",
    relatedProfiles: ["tecnologia-suporte", "atendimento-sucesso-cliente", "operacoes-processos", "dados-analise", "comercial-vendas"],
    studyTips: ["Análise de causa", "Registro de ocorrências", "Suporte técnico básico", "Melhoria contínua"],
    order: 8,
    questions: [
      {
        text: "Um cliente relata erro, mas não envia detalhes. O melhor pedido é:",
        options: abc("Mande print, horário do erro e o que tentou fazer", "Não posso ajudar", "Tente de novo para sempre", "Isso nunca acontece"),
        correctAnswer: "A",
        explanation: "Detalhes permitem reproduzir ou direcionar o problema.",
        order: 1
      },
      {
        text: "Um processo tem atraso toda sexta-feira. Primeiro você deve:",
        options: abc("Ignorar", "Investigar o que muda nesse dia", "Trocar todos os sistemas", "Eliminar a sexta-feira do controle"),
        correctAnswer: "B",
        explanation: "Padrões de tempo ajudam a encontrar causa.",
        order: 2
      },
      {
        text: "Quando uma solução funciona, é importante:",
        options: abc("Não contar para ninguém", "Registrar o que foi feito para repetir se necessário", "Apagar evidências", "Mudar tudo de novo"),
        correctAnswer: "B",
        explanation: "Registro transforma solução em aprendizado.",
        order: 3
      },
      {
        text: "Se duas ações podem resolver, a melhor escolha inicial costuma ser:",
        options: abc("A mais cara sempre", "A mais simples, reversível e com menor risco", "A mais demorada", "A que ninguém entende"),
        correctAnswer: "B",
        explanation: "Soluções simples e reversíveis reduzem risco.",
        order: 4
      },
      {
        text: "Um indicador piorou no mês. O próximo passo é:",
        options: abc("Olhar dados por período, causa provável e mudanças recentes", "Fingir que não viu", "Alterar o número", "Culpar uma pessoa sem investigar"),
        correctAnswer: "A",
        explanation: "Análise estruturada evita conclusões apressadas.",
        order: 5
      }
    ]
  }
];
