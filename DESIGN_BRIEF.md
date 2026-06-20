# DESIGN_BRIEF.md — Briefing para redesign do Minha Aptidão

Use este arquivo como instrução obrigatória para qualquer ferramenta/agente de design que vá remodelar a plataforma.

## Projeto

**Nome:** Minha Aptidão / Mapa de Aptidão  
**Tipo:** Plataforma web de orientação profissional, currículo e vagas.  
**Stack:** Next.js 16 App Router + React 19 + TypeScript + Prisma + PostgreSQL.  
**UI atual:** dark glassmorphism com roxo, azul e verde.  
**Idioma:** português do Brasil.  
**Ícones:** `lucide-react`.  

## Objetivo do redesign

Melhorar visual, hierarquia, responsividade, usabilidade e aparência profissional da plataforma **sem mudar funcionalidades, sem inventar fluxos e sem quebrar rotas/APIs existentes**.

O redesign deve entregar apenas uma proposta visual aplicável à estrutura existente.

---

## Regras absolutas

1. Não inventar funções novas.
2. Não remover funções existentes.
3. Não mudar nomes de rotas.
4. Não mudar contratos de API.
5. Não mudar estrutura do banco.
6. Não alterar lógica de auth, currículo, teste, vagas, admin ou mentor.
7. Não criar botões que não existam como funcionalidade real.
8. Não prometer candidatura automática onde o app exige ação manual.
9. Não usar texto em inglês na UI final.
10. Não usar emoji como ícone; usar `lucide-react`.
11. Não transformar currículo em imagem; preservar texto selecionável nas áreas de exportação.
12. Não usar bibliotecas novas sem justificar.
13. Não criar um app paralelo.
14. Não substituir o projeto por template genérico.
15. Não expor dados pessoais, tokens, `.env` ou secrets.

---

## O que pode mudar

Pode redesenhar:

- layout das páginas;
- cards;
- botões;
- navegação;
- espaçamento;
- grids;
- tabelas/listas;
- hierarquia visual;
- responsividade mobile;
- estados vazios;
- banners/avisos;
- cores dentro da identidade;
- tipografia segura;
- preview visual do currículo;
- dashboards e painéis.

Mas deve manter a lógica e os dados existentes.

---

## Design system existente

Arquivo principal:

```txt
src/app/globals.css
```

Classes globais usadas:

```txt
.page-shell
.card
.button
.button.secondary
.button.ghost
.field
.pill
.eyebrow
.muted
.warning-box
.form-error
.loading-state
.inline-loading
.spin
```

O redesign deve evoluir essas classes em vez de criar uma identidade completamente incompatível.

---

## Rotas principais existentes

Preservar todas:

```txt
/
/login
/cadastro
/perfil
/teste
/resultado/[id]
/curriculo/[id]
/mentor/[id]
/vagas
/vagas/[id]
/vagas/preferencias
/vagas/publicar
/vagas/historico
/vagas/notificacoes
/privacidade
/sobre
/admin
```

---

## Áreas funcionais existentes

### Home

Explica o produto e leva para teste/cadastro.

### Teste de aptidão

Questionário com progresso e opções de resposta.

### Resultado

Mostra perfis profissionais, pontuação, forças, pontos de atenção, cursos, vídeos e ações.

### Currículo

Editor profissional com:

- dados do usuário;
- templates;
- visual;
- seções;
- versões;
- pontuação;
- sugestões;
- exportação PDF visual;
- exportação PDF ATS;
- texto simples.

### Vagas

Busca vagas, seleciona vagas, publica currículo, mostra fila, histórico e notificações.

Importante: Greenhouse, LinkedIn, Indeed e outros portais podem exigir ação manual. Não desenhar como se tudo fosse 100% automático.

### Admin

Painel interno para gestão de perguntas, perfis, cursos, fontes ATS e logs.

---

## Stack visual permitida

Preferência:

- CSS global existente;
- inline style onde já existe;
- Tailwind se já estiver em uso;
- componentes React/TSX existentes;
- `lucide-react` para ícones.

Evitar adicionar:

- shadcn/ui sem necessidade;
- Bootstrap;
- Material UI;
- dependências pesadas;
- animações exageradas;
- bibliotecas que mudem a arquitetura.

---

## Arquivos mais importantes para redesign

```txt
src/app/globals.css
src/app/page.tsx
src/app/layout.tsx
src/app/perfil/page.tsx
src/app/resultado/[id]/page.tsx
src/app/curriculo/[id]/page.tsx
src/components/ResumeBuilderClient.tsx
src/components/VagasClient.tsx
src/components/PublishQueueClient.tsx
src/components/JobPreferencesClient.tsx
src/components/JobProfileClient.tsx
src/components/AdminDashboard.tsx
src/components/TestClient.tsx
src/components/QuestionCard.tsx
src/components/ResultActions.tsx
src/components/ProfileResultCard.tsx
```

---

## Formato de entrega esperado do Cloud Design

A melhor entrega é uma destas opções:

### Opção A — Patch/diff

Um arquivo `.patch` ou diff Git com alterações em arquivos existentes.

Exemplo:

```txt
redesign-minha-aptidao.patch
```

### Opção B — Arquivos TSX/CSS completos

Pasta contendo somente arquivos alterados, mantendo o mesmo caminho do projeto.

Exemplo:

```txt
redesign/
  src/app/globals.css
  src/app/page.tsx
  src/components/ResumeBuilderClient.tsx
  src/components/VagasClient.tsx
```

### Opção C — Protótipo HTML/CSS

Aceitável apenas como referência visual. Nesse caso, a IA de desenvolvimento precisará converter manualmente para o app real.

---

## O que não enviar

Não enviar:

```txt
.env
node_modules/
.next/
dumps de banco
backups
secrets
chaves privadas
tokens
arquivos gerados gigantes
```

---

## Como trazer o design de volta para aplicar

Depois que o Cloud Design gerar o redesign, envie para o desenvolvedor/IA de código um destes formatos:

1. **Preferido:** arquivo `.patch`.
2. **Bom:** `.zip` com arquivos alterados preservando caminhos.
3. **Aceitável:** links ou blocos de código dos arquivos alterados.
4. **Último caso:** prints/protótipo visual para recriação manual.

Coloque o arquivo dentro de uma pasta temporária no servidor/projeto, por exemplo:

```txt
/opt/aptidao-app/design-incoming/
```

Estrutura recomendada:

```txt
/opt/aptidao-app/design-incoming/redesign.patch
```

ou:

```txt
/opt/aptidao-app/design-incoming/src/app/globals.css
/opt/aptidao-app/design-incoming/src/components/ResumeBuilderClient.tsx
```

Depois peça:

```txt
Aplique o redesign de /opt/aptidao-app/design-incoming respeitando DESIGN_BRIEF.md e sem quebrar funcionalidades.
```

---

## Checklist para validar o redesign

Antes de aceitar, verificar:

- `/` abre.
- `/login` abre.
- `/cadastro` abre.
- `/perfil` abre logado.
- `/teste` funciona.
- `/resultado/[id]` mantém ações.
- `/curriculo/[id]` mantém editor, templates, pontuação, versões e exportação.
- `/vagas` mantém busca, seleção e publicação.
- `/vagas/publicar` mostra fila e ações manuais.
- `/admin` continua acessível.
- Mobile não tem scroll horizontal.
- Botões têm ações reais.
- Textos estão em português.
- Nenhum secret foi adicionado.
- `npx tsc --noEmit` passa.
- `npm run build` passa.

---

## Mensagem curta para colar no Cloud Design

```txt
Redesenhe a plataforma Minha Aptidão usando Next.js/React/TypeScript. Preserve todas as rotas, APIs, funções e dados existentes. Não invente botões sem função real. Não altere banco, auth, currículo, vagas, admin ou mentor. Trabalhe em cima dos arquivos existentes, principalmente src/app/globals.css e componentes em src/components. UI em português do Brasil, estilo profissional dark glassmorphism, responsivo, acessível, usando lucide-react. Entregue preferencialmente um patch Git ou arquivos TSX/CSS alterados preservando caminhos. Siga todas as regras do DESIGN_BRIEF.md.
```
