# Auditoria de Compatibilidade e Configuração de Produção na Vercel

Este documento consolida a auditoria técnica de compatibilidade da **Plataforma Anderson Palafoz** com a arquitetura de serverless e build da **Vercel** [1]. O objetivo é garantir que todas as funcionalidades críticas — autenticação, persistência Neon, pagamentos Stripe, rotinas Heartbeat e multimídia de aulas — operem de maneira contínua e sem erros em ambiente de produção [2].

## 1. Variáveis de Ambiente Exigidas em Produção

Para que o aplicativo seja compilado e executado sem falhas na Vercel, o painel de configuração do projeto na Vercel (`Settings > Environment Variables`) deve conter as seguintes chaves ativas para o ambiente **Production** [3]:

| Chave de Ambiente | Finalidade no Ecossistema | Escopo Obrigatório |
|---|---|---|
| `DATABASE_URL` / `NEON_DATABASE_URL` | Conexão com o banco PostgreSQL gerenciado no Neon para persistência de cursos, alunos e matrículas [4]. | Servidor (Production) |
| `STRIPE_SECRET_KEY` | Chave secreta de integração para processamento de pagamentos e sessões de checkout dos Cursos Tipos 1 e 2 [5]. | Servidor (Production) |
| `STRIPE_WEBHOOK_SECRET` | Chave de assinatura para validação de webhooks do Stripe, garantindo fulfillment idempotente [5]. | Servidor (Production) |
| `NEXTAUTH_SECRET` / `JWT_SECRET` | Chave de criptografia e assinatura de cookies de sessão de autenticação do NextAuth [6]. | Servidor (Production) |
| `NEXTAUTH_URL` | URL canônica de produção da plataforma (ex: `https://andersonpalafoz.vercel.app`) para redirecionamentos OAuth corretos [6]. | Público / Servidor |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Integração com o armazenamento S3 e buckets de áudio e certificados [7]. | Servidor (Production) |

## 2. Instruções para Verificação e Configuração na Vercel

Caso alguma variável esteja ausente no ambiente de produção da Vercel, siga o procedimento seguro diretamente no painel da Vercel:

1. Acesse o painel do seu projeto na Vercel em [vercel.com/dashboard](https://vercel.com/dashboard) [3].
2. Selecione o projeto **andersonpalafoz** e clique na aba **Settings** [3].
3. No menu lateral esquerdo, clique em **Environment Variables** [3].
4. Verifique se as chaves listadas acima estão marcadas para o ambiente **Production** [3]. Caso falte alguma, adicione o nome da chave, insira o valor correspondente e clique em **Save** [3].
5. Após atualizar as variáveis, vá para a aba **Deployments**, clique nos três pontos (`...`) ao lado do último deploy e selecione **Redeploy** para aplicar as novas variáveis imediatamente [3].

## 3. Considerações de Arquitetura Serverless

- **Rotas API e Edge/Node Runtime:** As rotas que realizam consultas ao Neon e chamadas ao Stripe rodam no runtime padrão Node.js da Vercel, garantindo compatibilidade total com os drivers Drizzle e `pg`.
- **Idempotência de Webhooks:** O webhook do Stripe foi endurecido para ignorar reprocessamentos e evitar matrículas duplicadas no banco [5].
- **Retenção Automática de 30 Dias:** A lixeira do sistema conta com a rota de Heartbeat `/api/scheduled/cleanup-trash`, permitindo a automação periódica de limpeza [8].

---

**Referências:**
- [1] Vercel Deployment Documentation. Disponível em: <https://vercel.com/docs>
- [2] Next.js 15 App Router Architecture. Disponível em: <https://nextjs.org/docs/app>
- [3] Vercel Environment Variables Management. Disponível em: <https://vercel.com/docs/projects/environment-variables>
- [4] Neon Serverless Postgres Guide. Disponível em: <https://neon.tech/docs>
- [5] Stripe API Reference & Webhooks. Disponível em: <https://docs.stripe.com/api>
- [6] NextAuth.js Configuration Guide. Disponível em: <https://next-auth.js.org/>
- [7] Supabase Storage Python & JavaScript SDK. Disponível em: <https://supabase.com/docs/reference/javascript/storage>
- [8] Manus Heartbeat SDK & Architecture. Disponível em documentação interna do projeto.
