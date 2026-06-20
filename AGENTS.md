# AGENTS.md — Instruções obrigatórias para qualquer IA/agentes que desenvolvam neste projeto

Este arquivo é lido automaticamente por ferramentas de IA (opencode, Claude Code, etc.)
antes de trabalhar no projeto. Siga TODAS as regras abaixo. Elas não são opcionais.

---

## Projeto: Mapa de Aptidão (Minha Aptidão)

- Stack: Next.js 16 (App Router) + TypeScript + Prisma 5 + PostgreSQL + Docker/Traefik.
- Em produção. Não quebre o que funciona.
- Linguagem do app: Português (pt-BR). Toda UI e mensagens em português.
- Design system: dark glassmorphism, classes em `src/app/globals.css` (`.page-shell`, `.card`, `.button`, `.field`, `.pill`, `.eyebrow`, etc.). Siga o padrão visual existente — não invente novo.
- Ícones: `lucide-react`.

---

## REGRA OBRIGATÓRIA: Versionamento e Changelog

**Sempre que você adicionar uma nova função, corrigir uma função que não está funcionando, ou remover uma função, você DEVE:**

1. **Bumpar a versão** no arquivo `VERSION` (raiz do projeto) e em `package.json` (`"version"`), mantendo os dois iguais.
2. **Adicionar uma entrada no `CHANGELOG.md`** (raiz do projeto) descrevendo a mudança.
3. **Rodar typecheck** (`npx tsc --noEmit`) e **build** (`npm run build`) para garantir que nada quebrou.

### Como bumpar a versão (SemVer)

| Tipo de mudança | Bump | Exemplo |
|---|---|---|
| Nova funcionalidade adicionada | **MINOR** | 1.0.0 → 1.1.0 |
| Correção de bug | **PATCH** | 1.1.0 → 1.1.1 |
| Função removida ou mudança que quebra compatibilidade | **MAJOR** | 1.1.0 → 2.0.0 |

Se a mudança envolver mais de um tipo, use a maior (ex: adicionou função E corrigiu bug → MINOR).

### Formato do CHANGELOG.md

Adicione uma nova seção no TOPO (logo abaixo do cabeçalho), acima da versão anterior:

```markdown
## [X.Y.Z] - AAAA-MM-DD

### Adicionado
- Descrição curta e clara da nova função.

### Corrigido
- Descrição do bug corrigido.

### Alterado
- O que mudou em função existente (sem quebrar).

### Removido
- O que foi retirado (acompanha bump MAJOR se quebrar compatibilidade).
```

Use apenas as categorias que se aplicam. Cada item começa com verbo ou substantivo claro.
Mantenha o histórico de versões anteriores abaixo — nunca apague entradas antigas.

### Onde o usuário vê isso

O changelog e a versão são exibidos ao usuário na página `/sobre` (acessível pelo perfil),
lidos pela API `/api/version` a partir dos arquivos `VERSION` e `CHANGELOG.md`. Por isso,
mantenha esses arquivos sempre atualizados e em português — o usuário final vai ler.

---

## Regras de não-destruição (NÃO QUEBRAR O PROJETO)

- **Não reescreva** funções existentes (teste de aptidão, currículo, perfil, cursos, auth).
- **Não remova** funções existentes a menos que seja estritamente necessário.
- **Não altere** o banco de forma destrutiva. Adicione tabelas/campos via migration nova — nunca modifique uma migration já aplicada.
- **Não apague** dados.
- **Não crie** campos duplicados se já existir campo equivalente.
- **Não mude** a identidade visual do sistema.
- Adições são bem-vindas; mudanças destrutivas exigem bump MAJOR e justificativa clara.

---

## Padrões técnicos

- **API routes**: sempre `export const dynamic = "force-dynamic"`, validar entrada com `zod`, proteger com `getSession()`/`getUser()` de `@/lib/auth`, logar erros com `logError()` de `@/lib/logging`.
- **Páginas (server components)**: `getUser()` + `redirect("/login")` se não autenticado, `dynamic = "force-dynamic"`.
- **Banco**: use o singleton `prisma` de `@/lib/prisma`. Nunca instancie `PrismaClient` diretamente.
- **Migrations**: crie em `prisma/migrations/{timestamp}_{nome}/migration.sql` no padrão das existentes. Rode `npx prisma generate` após mudar o `schema.prisma`.
- **Erros**: nunca exponha detalhes internos ao usuário. Use mensagens em português amigáveis.
- **Segurança**: nunca exponha/logue secrets ou senhas. Nunca commite `.env`.
- **Comentários**: NÃO adicione comentários no código a menos que seja explicitamente pedido.

---

## Antes de começar qualquer tarefa

1. Leia este arquivo (`AGENTS.md`) e o `CHANGELOG.md` para entender o estado atual.
2. Rode `/graphify` (se disponível) ou explore o projeto para entender a arquitetura antes de tocar em arquivos.
3. Identifique onde está o que você precisa alterar usando as ferramentas de busca.
4. Planeje a mudança verificando que não quebra o existente.

## Ao terminar qualquer tarefa

1. Bumpe a versão em `VERSION` e `package.json`.
2. Adicione entrada no `CHANGELOG.md`.
3. Rode `npx tsc --noEmit` — deve passar sem erros.
4. Rode `npm run build` — deve passar sem erros.
5. Rode `npx prisma validate` se tocou no schema.
6. Rebuild local da imagem Docker quando a mudança for para produção: `docker build -t aptidao-web:latest .`.
7. Suba para produção com recriação forçada do Swarm: `docker service update --force --image aptidao-web:latest aptidao_aptidao-web`.
8. Verifique produção com `/api/version`, `/sobre`, logs do serviço e migrations aplicadas.
9. Após deploy validado, atualize o GitHub: `git status`, `git diff`, commit com mensagem clara e `git push` para o repositório remoto oficial.
10. Nunca commite `.env`, secrets, dumps de banco, backups, `.next`, `node_modules` ou dados pessoais.
11. Informe ao usuário quais arquivos foram alterados, qual a nova versão, se o deploy passou e se o push GitHub foi concluído.
