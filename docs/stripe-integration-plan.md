# Plano de Implementação Stripe — Anderson Palafoz Platform

Gerado via `stripe_implementation_planner` em cooperação com o MCP da Stripe.

## Contexto do Negócio
- **Plataforma**: Anderson Palafoz Platform (Ensino de inglês, cursos digitais, aulas e materiais educacionais).
- **Modelos de Recebimento**: Pagamentos únicos (cursos e materiais avulsos) e assinaturas recorrentes (clubes de conversação e acompanhamento mensal).
- **Ambiente**: Test Mode configurado na conta `acct_1U4ZsHJk5k22Ds7s`.

## Arquitetura Recomendada
1. **Stripe Checkout**: Para redirecionamento seguro em páginas de venda de cursos e materiais.
2. **Stripe Billing / Subscriptions**: Para gerenciar mensalidades recorrentes de alunos.
3. **Webhooks (`/api/stripe/webhook`)**: Para atualizar automaticamente o status de matrícula e pedidos no banco de dados Neon PostgreSQL.
4. **Histórico e Recibos**: Páginas dedicadas de recibos (`/pagamento/recibo/[id]`) e painel de histórico de compras para os alunos.
