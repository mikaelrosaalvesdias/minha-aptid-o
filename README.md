# Minha Aptidão

**Minha Aptidão** é uma aplicação web gratuita para orientação profissional, criação de currículo, preparação para candidaturas e busca de vagas compatíveis com o perfil de aptidão do usuário.

O projeto combina teste de aptidão, recomendações de estudo, editor profissional de currículo, pontuação ATS/RH/visual e uma área de vagas com suporte a candidatura manual guiada e integração segura com ATS quando possível.

[![Version](https://img.shields.io/badge/version-1.4.1-10b981)](./VERSION)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Swarm-2496ED)](https://docs.docker.com/engine/swarm/)

---

## Sobre

O Minha Aptidão ajuda pessoas a entenderem seus pontos fortes, organizarem um currículo mais profissional e se candidatarem com mais segurança.

Principais objetivos:

- facilitar o autoconhecimento profissional;
- gerar um currículo baseado no resultado de aptidão;
- permitir edição profissional do currículo com templates;
- melhorar compatibilidade com sistemas ATS;
- orientar candidaturas sem burlar login, captcha, políticas de plataformas ou privacidade;
- manter o app gratuito e acessível.

O aplicativo **não substitui orientação psicológica, clínica ou vocacional profissional**.

---

## Funcionalidades

### Teste de aptidão

- Questionário de aptidão profissional.
- Cálculo de perfis compatíveis.
- Forças e pontos de atenção.
- Recomendações de cursos gratuitos, faculdades e vídeos.
- Testes práticos de capacidade por área.
- Mentor IA baseado no perfil do usuário.

### Editor profissional de currículo

- Currículo salvo no perfil do usuário.
- Galeria com 20 templates profissionais.
- Templates ATS, visuais, comerciais, tecnológicos, administrativos, primeiro emprego, estágio, jovem aprendiz e liderança.
- Edição de cores, fontes, margens, espaçamento, densidade, foto e seções.
- Controle para exibir, ocultar, renomear e reordenar seções.
- Versões múltiplas de currículo sem apagar o original.
- Definição de currículo principal.
- Pontuação geral, ATS, RH, visual, conteúdo, completude, clareza, objetividade e risco.
- Sugestões automáticas de melhoria sem inventar dados.
- Exportação em PDF visual, PDF ATS limpo e texto simples.

### Área de vagas

- Preferências de busca por cargo, área, cidade, estado, modelo, salário, nível e contrato.
- Busca em fontes públicas e boards ATS.
- Compatibilidade entre vaga e perfil de aptidão.
- Fila de candidatura com status por vaga.
- Pacote de candidatura para copiar/colar em formulários externos.
- Tratamento seguro para LinkedIn, Indeed, Vagas.com, InfoJobs e outros portais com login.
- Greenhouse tratado como ação manual guiada quando exigir chave privada da empresa.
- Pré-checagem de perguntas obrigatórias do Greenhouse quando disponíveis.

### Administração

- Painel administrativo.
- CRUD de perguntas, perfis, cursos e fontes ATS.
- Logs básicos.
- Seed idempotente.

---

## Arquitetura

```txt
Usuário
  ↓
Next.js App Router
  ├── Teste de aptidão
  ├── Resultado e mentor IA
  ├── Editor profissional de currículo
  ├── Área de vagas
  ├── Painel admin
  └── APIs internas
       ↓
Prisma ORM
       ↓
PostgreSQL
       ↓
Docker Swarm + Traefik + TLS
```

---

## Stack

- **Next.js 16** com App Router
- **React 19**
- **TypeScript**
- **Prisma 5**
- **PostgreSQL 16**
- **Docker / Docker Swarm**
- **Traefik** para proxy reverso e TLS
- **lucide-react** para ícones
- **jsPDF** para exportação de PDF
- **Zod** para validação
- **jose** para autenticação JWT

---

## Requisitos

- Node.js 20+
- PostgreSQL 16+
- Docker e Docker Compose/Swarm para produção
- npm

---

## Instalação local

```bash
git clone https://github.com/mikaelrosaalvesdias/minha-aptid-o.git
cd minha-aptid-o
cp .env.example .env
npm install
npx prisma generate
npm run dev
```

Acesse:

```txt
http://localhost:3000
```

---

## Banco local com Docker

```bash
docker compose up -d aptidao-db
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

---

## Variáveis de ambiente

Use `.env.example` como base.

```env
DATABASE_URL=postgresql://aptidao:change-me@aptidao-db:5432/aptidao?schema=public
POSTGRES_PASSWORD=change-me
ADMIN_PASSWORD=change-me
JWT_SECRET=change-me
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENAI_API_KEY=
YOUTUBE_API_KEY=
GOOGLE_SEARCH_API_KEY=
GOOGLE_SEARCH_ENGINE_ID=
CRON_SECRET=change-me
NODE_ENV=development
RUN_SEED=true
```

Nunca versione `.env`.

---

## Scripts

```bash
npm run dev              # desenvolvimento
npm run build            # prisma generate + build Next.js
npm run start            # start Next.js
npm run prisma:generate  # gerar Prisma Client
npm run prisma:migrate   # aplicar migrations
npm run prisma:seed      # rodar seed
```

Validação recomendada antes de deploy:

```bash
npx prisma validate
npx tsc --noEmit
npm run build
```

---

## Deploy em produção

O projeto está preparado para Docker Swarm com Traefik.

```bash
docker build -t aptidao-web:latest .
docker service update --force --image aptidao-web:latest aptidao_aptidao-web
```

Verificar:

```bash
docker stack services aptidao
docker service ps aptidao_aptidao-web
docker service logs --tail 100 aptidao_aptidao-web
```

O entrypoint executa automaticamente:

```bash
npx prisma migrate deploy
npx prisma db seed
```

---

## Segurança e privacidade

- O sistema não armazena senhas de plataformas terceiras.
- O app não tenta burlar login, captcha ou bloqueios de automação.
- Currículos e dados pessoais pertencem ao usuário.
- O usuário pode remover arquivos enviados.
- Candidaturas são feitas somente com consentimento.
- Greenhouse e outros ATS são tratados conforme suas regras públicas.

Para vulnerabilidades, siga as instruções em [SECURITY.md](./SECURITY.md).

---

## Versionamento

Este projeto usa SemVer.

- `MAJOR`: mudança incompatível ou remoção de função.
- `MINOR`: nova funcionalidade compatível.
- `PATCH`: correção compatível.

A versão atual fica em:

- [`VERSION`](./VERSION)
- `package.json`
- [`CHANGELOG.md`](./CHANGELOG.md)

A versão e changelog são exibidos no app em `/sobre`.

---

## Como contribuir

Veja [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Licença

Este projeto é gratuito. A licença pública pode ser ajustada conforme decisão do mantenedor.

---

Feito para ajudar pessoas a encontrarem caminhos profissionais com mais clareza, segurança e autonomia.
