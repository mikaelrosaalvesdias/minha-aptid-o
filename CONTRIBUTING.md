# Contribuindo

Obrigado por considerar contribuir com o Minha Aptidão.

## Princípios

- Preserve funções existentes.
- Não quebre dados salvos de usuários.
- Não exponha secrets, senhas ou dados pessoais.
- Mantenha UI e mensagens em português do Brasil.
- Siga o design system dark glassmorphism do projeto.
- Use migrations novas para banco; nunca edite migration já aplicada.

## Fluxo recomendado

1. Crie uma branch descritiva.
2. Faça mudanças pequenas e revisáveis.
3. Atualize `VERSION`, `package.json` e `CHANGELOG.md` quando adicionar, corrigir ou remover função.
4. Rode validações:

```bash
npx prisma validate
npx tsc --noEmit
npm run build
```

5. Abra PR explicando:
   - o que mudou;
   - como testar;
   - impacto em dados existentes;
   - migrations criadas, se houver.

## Commits

Use mensagens claras em português ou inglês técnico simples.

Exemplos:

```txt
fix: tratar Greenhouse como ação manual guiada
feat: adicionar versões de currículo
chore: atualizar changelog da versão 1.4.1
```

## Segurança

Não inclua `.env`, tokens, chaves privadas, dumps de banco ou dados pessoais em commits.
