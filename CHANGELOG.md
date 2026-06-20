# Changelog — Mapa de Aptidão (Minha Aptidão)

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/spec/v2.0.0.html).

Regras de versionamento:
- **MAJOR** (ex: 2.0.0) — mudança incompatível que quebra algo existente ou remove função.
- **MINOR** (ex: 1.1.0) — nova funcionalidade adicionada, compatível com o que existe.
- **PATCH** (ex: 1.0.1) — correção de bug, compatível com o que existe.

Categorias de mudança:
- **Adicionado** — nova funcionalidade.
- **Corrigido** — correção de bug.
- **Alterado** — mudança em funcionalidade existente (sem quebrar).
- **Removido** — função removida (geramente acompanha bump MAJOR).
- **Segurança** — correção de vulnerabilidade.

---

## [1.4.1] - 2026-06-20

### Corrigido
- Greenhouse não é mais tratado como candidatura automática pública. O envio por POST exige chave privada da empresa, então agora vira ação manual guiada em vez de falha 401.
- Candidaturas Greenhouse antigas que falharam com "HTTP Basic: Access denied" passam a ser marcadas como ação manual com orientação clara.
- Retentativas em vagas Greenhouse não tentam mais reenviar automaticamente sem credencial privada da empresa.

### Adicionado
- Pré-checagem de perguntas obrigatórias do Greenhouse via endpoint público `questions=true`, para mostrar campos como país, visto, autorização de trabalho, localização e perguntas específicas.
- Campos avançados no perfil de candidatura: país, código do país, localização completa, autorização de trabalho, necessidade de visto, cidadania/residência, inglês, salário atual, empregador/cargo atual ou anterior, escola, grau, disponibilidade presencial/híbrida e fonte da vaga.
- Pacote de candidatura manual agora inclui esses dados avançados para facilitar preenchimento em Greenhouse, LinkedIn, Indeed, Vagas.com e outros portais.

## [1.4.0] - 2026-06-20

### Adicionado
- Editor profissional de currículo dentro do fluxo atual, preservando o currículo já salvo no perfil.
- Galeria com 20 templates editáveis: ATS Limpo, Profissional Clássico, Moderno Corporativo, Comercial/Vendas, Marketing/Criativo, Tecnologia, Administrativo, Primeiro Emprego, Estágio, Jovem Aprendiz, Operacional, Executivo/Liderança, Minimalista, com Foto, sem Foto, Colorido Moderado, Preto e Branco, Uma Página, Duas Páginas e Destaque em Habilidades.
- Metadados completos por template: categoria, indicação de uso, nível profissional, compatibilidade ATS, foto, layout, cores, pontuação base, risco ATS, tags e badges.
- Personalização visual do currículo: cores, fontes seguras, tamanho de fonte, margens, espaçamento, densidade, foto, cabeçalho, destaques e ícones com texto.
- Controle de seções: exibir, ocultar, reordenar e renomear seções como dados pessoais, resumo, experiências, formação, habilidades, cursos, certificações, idiomas, projetos e links.
- Suporte a múltiplas versões de currículo sem duplicar os dados reais do usuário.
- Botões para salvar versão, duplicar variação e definir versão como principal.
- Pontuação geral 0-100 com notas separadas para ATS, RH, visual, conteúdo, completude, aderência, clareza e objetividade.
- Sugestões automáticas separadas por prioridade alta, média e baixa, sem inventar dados do usuário.
- Comparação de até 3 templates com notas ATS, RH, visual, risco e melhor uso.
- Recomendação inteligente de templates baseada em área, cargo desejado, candidatura automática, experiência e dados do currículo.
- Exportação em PDF visual com texto selecionável, PDF ATS limpo e texto simples para candidatura.
- API de templates de currículo, versões de currículo, duplicação, definição de principal, exportação e recomendação.
- Tabela ResumeVersion para salvar variações, template usado, configurações visuais, seções, pontuação, sugestões e histórico de exportações.

### Alterado
- Tela atual de currículo evoluída para editor profissional, mantendo a rota /curriculo/[id] e o currículo persistente existente.
- Área de vagas agora usa a versão principal/recomendada do currículo quando existir, mantendo fallback para o currículo antigo.
- Dados de currículo para cópia e candidatura manual agora podem usar a versão principal configurada pelo usuário.

## [1.3.0] - 2026-06-20

### Adicionado
- Editor de currículo persistente: o que o usuário edita (título, telefone, LinkedIn, resumo, experiências, formação) agora fica salvo no banco. Não perde mais ao recarregar a página.
- Botão "Salvar Currículo" no construtor (antes só tinha "Baixar PDF").
- Upload de currículo externo: usuário pode subir um PDF/DOC/TXT feito em outra plataforma (máx 2MB) e usar nas candidaturas. O texto do PDF é extraído e enviado ao ATS.
- Toggle para escolher qual currículo usar nas candidaturas: o criado no construtor ou o enviado por upload.
- Cada usuário agora tem um currículo único e diferenciado — não mais todos idênticos vindos do mesmo resultado de aptidão.
- Painel admin de fontes ATS: administrador pode adicionar, ativar, desativar e remover boards Greenhouse/Lever sem mexer em código.
- Tabela ATSBoard no banco com seed inicial dos 23 boards curados.
- Cron de busca automática: rota /api/jobs/cron protegida por token secreto (CRON_SECRET) que busca vagas para usuários com frequência diária ou semanal.
- Função reutilizável runJobSearchForUser — rota manual e cron compartilham a mesma lógica.
- Extração automática de e-mail de candidatura das descrições de vagas. Vagas com e-mail de contato ganham botão "Enviar por e-mail" com currículo pré-preenchido no corpo.
- API /api/resume (GET/PUT) para carregar e salvar o currículo editável.
- API /api/resume/upload (POST/DELETE) para subir e remover currículo externo.
- API /api/resume/download (GET) para baixar o currículo enviado.
- API /api/admin/ats-boards (GET/POST/PATCH/DELETE) para gerenciar boards ATS.
- Botão "Enviar por e-mail" individual na fila de publicação para vagas com applyEmail.
- Variável de ambiente CRON_SECRET no .env.example.

### Alterado
- Greenhouse e Lever agora leem boards ativos do banco (tabela ATSBoard) em vez de array hardcoded. Fallback hardcoded mantido se o seed não rodou.
- Rota /api/jobs/search refatorada para usar função reutilizável runJobSearchForUser (mesma lógica, menos duplicação).
- Candidatura via ATS agora inclui experiências, formação e resumo reais do usuário (do Resume), não só strengths/keywords.
- Se a vaga tem applyEmail, o status de candidatura manual inclui instrução sobre o e-mail.

---

## [1.2.0] - 2026-06-20

### Adicionado
- Candidatura automática real via APIs públicas de ATS (Greenhouse e Lever): o sistema envia o currículo do usuário diretamente ao sistema de seleção da empresa, sem login, sem credencial armazenada.
- Nova fonte de busca RemoteOK (API pública gratuita, sem chave) — mais vagas remotas reais.
- Nova fonte de busca Greenhouse (boards públicos curados de empresas como Notion, Stripe, Figma, Vercel, etc.) com candidatura automática embutida.
- Nova fonte de busca Lever (postings públicos curados) com candidatura automática embutida.
- Detecção automática de URLs de Greenhouse/Lever em vagas de outras fontes (Remotive, RemoteOK) — quando detectado, a vaga é marcada como candidatura automática.
- Botão "Copiar dados do currículo" na fila de publicação para vagas que exigem login (LinkedIn, Indeed, etc.) — o usuário cola no formulário externo sem precisar digitar.
- Botão "Enviar por e-mail" (mailto pré-preenchido) para vagas com e-mail de candidatura.
- API /api/jobs/resume-data que retorna os dados do currículo formatados para copiar.
- Campos atsBoard, atsJobId e applyEmail na tabela Job para suportar candidatura automática.
- Seção de privacidade da área de Vagas na página /privacidade: declaração clara de que o app não armazena senhas de plataformas terceiras.

### Alterado
- Função attemptAutoApply agora faz candidatura real (antes era placeholder que sempre retornava ação manual).
- Fontes marcadas como "auto" (Greenhouse, Lever) agora enviam o currículo via POST para a API pública do ATS — status vira "publicado" quando aceito.
- Fontes marcadas como "needs_login" (LinkedIn, Indeed, Vagas.com, Catho, InfoJobs) agora mostram "Copiar dados + Abrir vaga" em vez de apenas abrir o link.

---

## [1.1.0] - 2026-06-20

### Adicionado
- Área de Vagas: buscar vagas compatíveis com o perfil de aptidão do usuário.
- Tela de preferências de busca (cargo, área, cidade, estado, modelo, salário, nível, contrato, palavras-chave desejadas/evitar, frequência, notificações).
- Motor de busca de vagas (API pública Remotive + busca curada em portais BR: LinkedIn, Indeed, Vagas.com, InfoJobs, Google Vagas).
- Deduplicação de vagas por fonte + link + título + empresa + local.
- Nota de compatibilidade 0-100 entre usuário e vaga usando aptidão + forças + keywords + preferências (sem nova lógica de teste).
- Sistema de notificações internas quando novas vagas compatíveis são encontradas.
- Lista de vagas com filtros (cargo, cidade, modelo, salário, compatibilidade, status) e seleção múltipla.
- Botão "Publicar currículo nas vagas selecionadas" com consentimento obrigatório antes da publicação em lote.
- Fila de publicação com status por item (aguardando, em andamento, publicado, ação manual, falhou, bloqueado por login/captcha/política, site indisponível, vaga expirada).
- Tela de progresso da fila com auto-refresh e retry por item.
- Camada de compatibilidade por fonte (auto / link_only / needs_login / has_captcha / blocks_automation / untested).
- Fallback de ação manual com link da vaga para fontes não suportadas (não burla captcha/login/anti-bot).
- Tela de detalhe da vaga com descrição, requisitos, benefícios, compatibilidade e status da fonte.
- Histórico de buscas realizadas e candidaturas por usuário.
- Perfil de candidatura (JobProfile) que usa o currículo já salvo no perfil (Result de aptidão + dados de contato) — não altera o gerador de currículo existente.
- Link "Vagas" no header com badge de notificações não lidas.
- Card "Ir para Vagas" no perfil do usuário.
- 7 novas tabelas no banco (JobPreference, JobProfile, Job, JobNotification, JobConsent, JobApplication, JobSearchHistory) — não altera tabelas existentes.

---

## [1.0.0] - 2026-05-22

### Adicionado
- Teste de aptidão com 40+ perguntas e 10 perfis profissionais.
- Cálculo de resultado com top 3 perfis, forças e pontos de atenção.
- Geração de currículo (PDF) a partir do resultado de aptidão.
- Construtor de currículo com foto, resumo (IA opcional), experiências e formação.
- Recomendações de cursos gratuitos, faculdades e vídeos por perfil.
- Testes práticos de capacidade por área.
- Mentor IA (OpenAI) que conhece o perfil do usuário.
- Sistema de autenticação (JWT jose) com login e cadastro.
- Perfil do usuário com histórico de testes salvos.
- Painel administrativo (login, CRUD de perguntas, perfis, cursos, visão geral, logs).
- Banco PostgreSQL + Prisma com migrations automáticas no build.
- Deploy Docker + Traefik com TLS/Let's Encrypt.
- Página de privacidade e controle de dados (LGPD — deleção de sessão e resultado).
- Design system dark glassmorphism (violeta/azul/esmeralda) com Tailwind.
