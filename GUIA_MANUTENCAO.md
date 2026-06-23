# Guia de Manutenção e Operação - Anderson Palafoz Platform

Procedimentos para manter, atualizar e gerenciar a plataforma.

---

## 📋 Checklist de Inicialização

Quando a plataforma é iniciada pela primeira vez:

- [x] Repositório GitHub clonado
- [x] Dependências instaladas (`pnpm install`)
- [x] Banco de dados Supabase configurado
- [x] Migrations aplicadas
- [x] Dados de teste inseridos
- [x] OAuth Google configurado
- [x] Deploy no Vercel ativado
- [x] Domínio customizado configurado

---

## 🚀 Deploy e Publicação

### Fluxo de Deploy Automático

1. **Desenvolvimento Local**
   ```bash
   pnpm dev
   ```
   Acessa em: http://localhost:3000

2. **Validação Local**
   - Testar todas as rotas
   - Verificar responsividade
   - Confirmar autenticação

3. **Commit e Push**
   ```bash
   git add .
   git commit -m "Descrição das mudanças"
   git push origin main
   ```

4. **Deploy Automático**
   - Vercel detecta push para `main`
   - Build automático inicia
   - Testes executam
   - Deploy para produção

5. **Verificação Pós-Deploy**
   - Acessar https://andersonedu-ccizmxek.manus.space
   - Testar funcionalidades críticas
   - Verificar logs de erro

### Rollback em Caso de Erro

Se algo der errado após deploy:

```bash
# Ver histórico de commits
git log --oneline

# Reverter para commit anterior
git revert <commit-hash>
git push origin main

# Vercel automaticamente redeploy
```

---

## 🗄️ Banco de Dados

### Backup

**Manual (via Supabase Dashboard)**
1. Acesse https://supabase.com
2. Selecione o projeto
3. Vá para "Database" → "Backups"
4. Clique "Create backup"

**Automático**
- Supabase faz backup diário automaticamente
- Retenção: últimos 7 dias

### Restauração

1. Supabase Dashboard → Backups
2. Selecione backup desejado
3. Clique "Restore"
4. Confirme (isso sobrescreverá dados atuais)

### Migrations

#### Criar Nova Migration

1. Edite `drizzle/schema.ts` com novas tabelas/colunas
2. Gere SQL:
   ```bash
   pnpm drizzle-kit generate
   ```
3. Revise SQL gerado em `drizzle/migrations/`
4. Aplique:
   ```bash
   pnpm drizzle-kit migrate
   ```

#### Exemplo: Adicionar Coluna

```typescript
// drizzle/schema.ts
export const courses = mysqlTable("courses", {
  // ... existing columns
  thumbnail: text("thumbnail"), // Nova coluna
});
```

```bash
pnpm drizzle-kit generate
# Revise o SQL gerado
pnpm drizzle-kit migrate
```

### Inserir Dados de Teste

```sql
-- Inserir curso
INSERT INTO courses (title, description, level, modules, instructor)
VALUES ('English Basics', 'Fundamentos essenciais...', 'A1', 8, 'Anderson Palafoz');

-- Inserir material
INSERT INTO materials (title, description, category, level, fileUrl, downloads)
VALUES ('Grammar Exercises', 'Exercícios práticos...', 'Exercícios', 'A1', 'https://...', 0);

-- Inserir artigo
INSERT INTO articles (title, slug, content, category, readingTime, published)
VALUES ('CEFR Guide', 'cefr-guide', 'Conteúdo do artigo...', 'Educação', 8, TRUE);
```

---

## 🔐 Segurança

### Variáveis de Ambiente

**Nunca commit** `.env` ou `.env.local`:

```bash
# .gitignore
.env
.env.local
.env.*.local
```

**Variáveis obrigatórias** (configuradas no Vercel):
- `DATABASE_URL`
- `JWT_SECRET`
- `VITE_APP_ID`
- `OAUTH_SERVER_URL`
- `VITE_OAUTH_PORTAL_URL`

### OAuth Google

**Configuração**
1. Google Cloud Console
2. Criar projeto
3. Habilitar Google+ API
4. Criar credenciais OAuth 2.0
5. Adicionar redirect URI: `https://andersonedu-ccizmxek.manus.space/api/oauth/callback`

**Rotação de Credenciais**
- Gere novas credenciais a cada 6 meses
- Atualize `VITE_APP_ID` no Vercel
- Teste login após atualização

### Proteção de Rotas

Rotas privadas (`/dashboard/*`) são protegidas por:
- Hook `useProtectedRoute()`
- Verificação de session cookie
- Redirecionamento automático para home

---

## 📊 Monitoramento

### Logs

**Dev Server**
```bash
tail -f .manus-logs/devserver.log
```

**Browser Console**
```bash
tail -f .manus-logs/browserConsole.log
```

**Network Requests**
```bash
tail -f .manus-logs/networkRequests.log
```

### Métricas

**Vercel Dashboard**
- Deployments
- Build time
- Function invocations
- Error rates

**Supabase Dashboard**
- Database queries
- API requests
- Storage usage
- Auth logs

### Alertas

Configure alertas no Vercel para:
- Build failures
- High error rates
- Performance degradation

---

## 🔧 Atualizações

### Dependências

**Verificar atualizações**
```bash
pnpm outdated
```

**Atualizar tudo**
```bash
pnpm update
```

**Atualizar pacote específico**
```bash
pnpm add package@latest
```

**Após atualizar**
1. Teste localmente: `pnpm dev`
2. Rode testes: `pnpm test`
3. Type check: `pnpm check`
4. Commit e push

### Node.js

Vercel usa Node.js 20 LTS por padrão.

Para especificar versão, edite `package.json`:
```json
{
  "engines": {
    "node": "20.x"
  }
}
```

---

## 🐛 Troubleshooting

### Build Falha

**Erro: TypeScript**
```bash
pnpm check
# Corrija erros
pnpm build
```

**Erro: Dependências**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### Banco de Dados Lento

1. Verifique índices em `drizzle/schema.ts`
2. Analise queries lentas no Supabase
3. Otimize queries em `server/db.ts`
4. Considere cache com React Query

### OAuth Não Funciona

1. Verifique `VITE_APP_ID` e `OAUTH_SERVER_URL`
2. Confirme redirect URI no Google Console
3. Limpe cookies do navegador
4. Teste em incógnito

### Responsividade Quebrada

1. Verifique viewport meta tag em `client/index.html`
2. Teste em diferentes breakpoints
3. Revise Tailwind config
4. Use `pnpm dev` para hot reload

---

## 📝 Procedimentos Regulares

### Diário
- [ ] Monitorar logs de erro
- [ ] Verificar uptime da plataforma
- [ ] Responder a mensagens de contato

### Semanal
- [ ] Revisar analytics
- [ ] Verificar feedback de usuários
- [ ] Atualizar conteúdo se necessário

### Mensal
- [ ] Atualizar dependências
- [ ] Executar testes de segurança
- [ ] Fazer backup manual
- [ ] Revisar performance

### Trimestral
- [ ] Auditar código
- [ ] Planejar novas features
- [ ] Revisar arquitetura
- [ ] Rotacionar credenciais OAuth

---

## 📞 Contato e Suporte

**Responsável**: Anderson Palafoz

**Contatos**:
- Email: [seu email]
- WhatsApp: 71 9 9122-2257 ou 71 9 9301-9199
- Instagram: @andersonpalafoz

---

## 📚 Documentação Relacionada

- [PLATAFORMA_GUIA.md](./PLATAFORMA_GUIA.md) - Guia técnico completo
- [GUIA_PROFESSOR.md](./GUIA_PROFESSOR.md) - Guia do professor
- [ARQUITETURA_TECNICA.md](./ARQUITETURA_TECNICA.md) - Arquitetura técnica
- [README.md](./README.md) - Readme do projeto

---

*Last updated: June 2026*
*Version: 1.0.0*
