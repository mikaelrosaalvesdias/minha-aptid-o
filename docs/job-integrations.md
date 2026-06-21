# Job Distribution & Profile Integration Layer

## Visão geral

A camada de integrações prepara o Minha Aptidão para conectar contas externas, buscar/importar vagas, salvar currículo em storage externo e registrar candidaturas assistidas sem prometer automação inexistente.

Nenhum provider usa Playwright, Puppeteer, Selenium, scraping autenticado, login simulado ou captura de senha. Fluxos reais dependem de OAuth oficial, API oficial, API de parceiro, Composio ou modo manual assistido com consentimento explícito.

## Providers preparados

- LinkedIn: `pending_credentials`, `composio`, capacidades `connect_account`, `sync_profile`, `publish_resume_link`.
- Google Drive: `pending_credentials`, `composio`, capacidades `connect_account`, `upload_resume`, `export_pdf`.
- Gupy: `pending_partner_access`, capacidades limitadas até existir API/parceria.
- Catho: `manual_assisted`, sem candidatura automática.
- Vagas.com.br: `pending_partner_access`, busca/importação dependem de feed/API.
- InfoJobs: `pending_partner_access`, sem API oficial configurada.
- Indeed Brasil: `pending_partner_access`, Indeed Apply depende de parceiro/API.
- Manual Assisted: provider interno para fluxos manuais com consentimento.

## Banco de dados

Migration criada: `20260621090000_add_job_integrations`.

Principais tabelas:

- `IntegrationProvider`
- `UserExternalConnection`
- `ExternalJob`
- `JobMatch`
- `ExternalJobApplication`
- `IntegrationLog`
- `IntegrationRateLimit`

O modelo `ResumeVersion` recebeu campos opcionais de Google Drive: `driveFileId`, `driveFileUrl` e `driveExportUrl`.

## Rotas admin

- `GET /api/admin/integrations/providers`
- `POST /api/admin/integrations/providers`
- `GET /api/admin/integrations/providers/:id`
- `PUT /api/admin/integrations/providers/:id`
- `POST /api/admin/integrations/providers/:id` com `{ "action": "test" | "enable" | "disable" }`
- `GET /api/admin/integrations/logs`
- `GET /api/admin/integrations/health`

O admin também ganhou a seção **Integrações de Vagas** em `AdminDashboard`.

## Rotas do usuário

- `GET /api/user/integrations`
- `POST /api/user/integrations/:providerSlug/connect`
- `POST /api/user/integrations/:providerSlug/callback`
- `DELETE /api/user/integrations/:connectionId`
- `POST /api/user/integrations/:connectionId/sync`
- `GET /api/user/applications`
- `POST /api/user/applications/:id/sync-status`

A página `/perfil` agora mostra **Contas conectadas** e não exibe botão funcional quando o provider não tem fluxo real configurado.

## Rotas de vagas externas

- `POST /api/jobs/:id/match`

## Como configurar `.env`

Mínimo recomendado:

```env
INTEGRATION_SECRET=change-me
COMPOSIO_API_KEY=
COMPOSIO_BASE_URL=
COMPOSIO_PROJECT_ID=
COMPOSIO_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=https://aptidao.n8nmikael.com.br
```

Opcionais por provider:

```env
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GUPY_API_KEY=
GUPY_BASE_URL=
CATHO_API_KEY=
CATHO_BASE_URL=
VAGAS_API_KEY=
VAGAS_BASE_URL=
INFOJOBS_API_KEY=
INFOJOBS_BASE_URL=
INDEED_CLIENT_ID=
INDEED_CLIENT_SECRET=
INDEED_API_KEY=
INDEED_BASE_URL=
PARTNER_JOBS_API_KEY=
```

Secrets são criptografados com AES-256-GCM antes de salvar no banco. Tokens nunca são expostos ao frontend ou logs.

## Como testar conexão

1. Entre no admin.
2. Abra **Integrações de Vagas**.
3. Selecione um provider.
4. Use **Testar**.
5. Providers pendentes retornam erro controlado, não quebram o sistema e registram log.

## Como testar busca de vaga

A arquitetura está preparada para `ExternalJob`, `JobMatch` e `ExternalJobApplication`. Busca real por provider ainda depende de API/parceria oficial configurada.

## Como testar candidatura

Use o modo manual assistido:

1. O usuário visualiza uma vaga externa.
2. O sistema exige aprovação/consentimento antes de registrar candidatura.
3. A candidatura é salva como `manual_assisted` e `pending_user_approval` até confirmação.

Nenhuma candidatura automática é executada sem provider ativo, capability real e consentimento.

## Próximos passos

- Implementar OAuth/Composio real para LinkedIn e Google Drive quando as credenciais forem fornecidas.
- Implementar importação de vagas quando houver API/feed oficial de Gupy, Catho, Vagas.com.br, InfoJobs ou Indeed.
- Criar workers para sincronizar perfis, vagas, tokens expirados, status de candidaturas e limpeza de logs.
