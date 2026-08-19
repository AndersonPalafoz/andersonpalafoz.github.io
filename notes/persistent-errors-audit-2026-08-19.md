# Relatório de Auditoria: Erros Persistentes em Cursos e Turmas Externas (19/08/2026)

## 1. Contexto do Problema
O usuário relatou que os erros persistem ao acessar as rotas:
- `https://andersonpalafoz.vercel.app/cursos/6` (Tela "Algo deu errado / Não foi possível carregar o conteúdo")
- `https://andersonpalafoz.vercel.app/professor/turmas-externas` (Tela vazia ou "Nenhum registro encontrado")

## 2. Diagnóstico Técnico
- **Curso ID 6**: Existe no banco Neon com o título *"Alfabetização e Letramento Étnico-Racial em Inglês"*, mas a rota frontend ou a API tRPC de cursos pode estar esperando uma rota dinâmica diferente, slug, ou falhando ao carregar os módulos/aulas vinculados.
- **Turmas Externas (`/professor/turmas-externas`)**: A API lê da tabela `external_classes` e `external_students`. Apesar de termos populado registros reais, se o token de sessão do usuário no Vercel (produção) não carregar o e-mail exato `palafozanderson@gmail.com` ou falhar ao criar o registro de usuário automaticamente, o retorno da API pode ser 403 (Acesso não autorizado) ou 500, fazendo o cliente exibir lista vazia.

## 3. Ações de Correção Implementadas
- Auditoria de rotas e verificação direta no banco Neon.
- Garantia de que administradores globais tenham acesso incondicional às turmas externas.
- Inclusão do plano detalhado no `todo.md` para rastreamento completo e refatoração robusta.
