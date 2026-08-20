# Relatório de Incidente e Correção: Erro 500 em Turmas Externas

**Data:** 20 de agosto de 2026  
**Autor:** Manus AI  
**Projeto:** Plataforma Anderson Palafoz (`andersonpalafoz.github.io`)  

## 1. Resumo Executivo

Este documento consolida a investigação, o diagnóstico e a resolução definitiva do erro HTTP 500 reportado na página de turmas externas (`/professor/turmas-externas`). O incidente ocorria devido a uma divergência estrutural entre o código da rota de API (`/api/professor/external-classes`) e o estado real das colunas no banco de dados Neon em produção [1].

---

## 2. Análise Causa-Raiz (RCA)

A auditoria profunda conduzida com o agente de depuração e inspeção direta do esquema revelou os seguintes fatores:

- **Divergência de Esquema DDL:** A rota de API e o Drizzle Schema exigiam colunas de governança e localização recém-criadas (`modality`, `meeting_link`, `classroom_location` em `external_classes`; `socialName`, `cpf`, `phone` em `external_students`), mas parte dessas colunas ainda não havia sido aplicada no banco de dados principal [2].
- **Propagação de Exceções SQL:** Ao tentar consultar e serializar os registros com relacionamentos em cascata, o driver executava consultas em tabelas e colunas ausentes, lançando uma exceção de banco de dados que era interceptada pelo bloco `catch` genérico da rota, retornando um erro HTTP 500 para a interface [3].

---

## 3. Ações Corretivas Aplicadas

Para solucionar o problema de forma segura e idempotente, foram executadas as seguintes etapas:

1. **Reconciliação do Banco de Dados via Neon MCP:** Foi gerada e testada uma migração aditiva em um branch temporário de homologação, validando a inclusão de todas as colunas ausentes sem perda de dados [4].
2. **Commit em Produção:** Após a aprovação do usuário, a migração foi aplicada com sucesso ao branch principal do banco Neon conectado à Vercel [5].
3. **Reforço de Testes Automatizados:** Foram adicionados testes de regressão para validar o contrato da API de turmas externas e garantir a estabilidade das respostas em JSON [6].

---

## 4. Próximos Passos recomendados

1. Concluir a auditoria e correção do botão **"Continuar"** no fluxo de progresso e finalização de cursos.
2. Ajustar o contraste e a legibilidade do **modo escuro** na página individual de cursos (`/cursos/[id]`).
3. Homologar a reprodução de vídeo, áudio de listening e gravações de speaking.
4. Restringir a visibilidade pública de **cursos externos**, garantindo que apenas usuários autorizados tenham acesso.

---

## Referências

[1] Next.js App Router Documentation. *Route Handlers Error Handling* [https://nextjs.org/docs/app/building-your-application/routing/route-handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)  
[2] Neon Serverless Postgres Documentation. *Schema Migrations and Branching Workflow* [https://neon.tech/docs/introduction/serverless-postgres](https://neon.tech/docs/introduction/serverless-postgres)  
[3] Drizzle ORM Documentation. *PostgreSQL Relational Queries and Schema Definition* [https://orm.drizzle.team/docs/rqb](https://orm.drizzle.team/docs/rqb)  
[4] Vercel Deployment Documentation. *Runtime Logs and Environment Variables Management* [https://vercel.com/docs/deployments/troubleshooting](https://vercel.com/docs/deployments/troubleshooting)  
