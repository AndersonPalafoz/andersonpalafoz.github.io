# Implementação das recomendações — Turmas Externas

**Data:** 27 de agosto de 2026
**Base:** commit `2c44fb0`
**Status:** alterações implementadas, validadas e publicadas em produção.

## Resumo

Foram aplicadas as recomendações preventivas da auditoria das páginas de Turmas Externas. As mudanças reforçam a integridade dos dados de frequência, a validação de URLs de materiais, a semântica de erros para exclusões de recursos inexistentes, a deduplicação da notificação de notas e a preparação da coleta de integração no GitHub Actions.

| Recomendação | Implementação | Estado |
|---|---|---|
| Validar IDs da chamada contra a turma | `saveAttendance` consulta os alunos da turma e rejeita IDs desconhecidos | Implementado |
| Validar URL de material no servidor | URLs HTTP/HTTPS são aceitas; caminhos internos `/manus-storage/` são preservados; demais esquemas são rejeitados | Implementado |
| Padronizar exclusões inexistentes | `deleteStudent`, `deleteGrade` e `deleteMaterial` retornam 404 específico | Implementado |
| Unificar notificação de nota | Removida a inserção direta duplicada de `saveGrade`; o fluxo usa `notifyGradeChange` | Implementado |
| Preparar CI para Neon | Workflow passa `secrets.NEON_DATABASE_URL` ao passo de testes sem armazenar segredo no repositório | Implementado; secret precisa existir no GitHub |
| Centralizar autorização | Identificada como melhoria estrutural; não foi feita alteração ampla para evitar duplicar consultas e risco de regressão | Parcial — recomendação futura |
| Axe/Lighthouse e teclado | A cobertura de contrato e layout permanece; não há runner dedicado configurado nesta execução | Pendente — recomendação futura |
| Download binário em staging | Não executado para evitar geração de arquivos e dados durante a validação | Pendente — staging |

## Arquivos alterados

`app/api/professor/external-classes/route.ts` recebeu as validações e respostas de API. `app/professor/external-classes-api-contract.test.ts` recebeu quatro verificações de contrato para impedir regressões. `.github/workflows/ci.yml` passou a encaminhar a secret `NEON_DATABASE_URL` ao passo de testes.

## Validação

A verificação TypeScript passou sem erros. A suíte focada passou com **20 arquivos e 88 testes**. O build de produção com DSN placeholder compilou e gerou as 138 páginas estáticas; houve apenas aviso de conexão recusada ao consultar artigos no ambiente local, sem falha de build.

A suíte completa anterior registrou **201 arquivos e 628 testes aprovados**, com seis falhas de coleta por ausência de variável de banco. O workflow agora está preparado para utilizar `secrets.NEON_DATABASE_URL`; para eliminar as seis falhas no GitHub Actions, o administrador do repositório ainda precisa cadastrar essa secret em **Settings → Secrets and variables → Actions**.

## Publicação e verificação em produção

O commit `2c44fb0c27056749d901bbb529df3be3067cabb1` foi publicado pela integração Git na Vercel com estado **READY**, deployment `dpl_BF5YNvBKia7nNtN1GdtH4Tg9bKvr` e URL de inspeção [Vercel](https://vercel.com/palafozanderson-2076s-projects/andersonpalafoz/BF5YNvBKia7nNtN1GdtH4Tg9bKvr). A página pública [andersonpalafoz.vercel.app/professor/turmas-externas](https://andersonpalafoz.vercel.app/professor/turmas-externas) foi aberta após a publicação e carregou os indicadores, as duas turmas, os controles por papel e o gráfico comparativo.

Nenhuma alteração de dados acadêmicos foi executada. As alterações de API são compatíveis com a fórmula SIMAL existente: prova escrita até 8,0 + apresentação até 2,0.

## Referências

[1]: https://github.com/AndersonPalafoz/andersonpalafoz.github.io/blob/main/app/api/professor/external-classes/route.ts
[2]: https://github.com/AndersonPalafoz/andersonpalafoz.github.io/blob/main/app/professor/external-classes-api-contract.test.ts
[3]: https://github.com/AndersonPalafoz/andersonpalafoz.github.io/blob/main/.github/workflows/ci.yml
