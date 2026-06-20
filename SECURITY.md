# Segurança

Se encontrar uma vulnerabilidade no Minha Aptidão, não abra uma issue pública com detalhes sensíveis.

## Como reportar

Envie as informações diretamente ao mantenedor do projeto pelo canal privado definido no GitHub do repositório.

Inclua, se possível:

- descrição do problema;
- passos para reproduzir;
- impacto esperado;
- evidências sem dados pessoais reais;
- sugestão de correção, se houver.

## Boas práticas do projeto

- `.env` nunca deve ser versionado.
- Secrets não devem aparecer em logs.
- Dados pessoais de currículo não devem ser expostos sem autenticação.
- Rotas sensíveis devem usar `getSession()` ou `getUser()`.
- APIs devem validar entrada com `zod`.
- Erros internos não devem ser exibidos ao usuário final.
- Candidaturas externas não devem burlar login, captcha, autenticação privada ou regras dos portais.

## Dependências

Antes de produção, rode:

```bash
npm audit
npx prisma validate
npx tsc --noEmit
npm run build
```
