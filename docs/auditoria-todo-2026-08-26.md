# Auditoria do `todo.md`

**Data:** 26 de agosto de 2026.

## Resultado

O checklist possui **2.343 linhas**, **317 seções**, **1.493 itens concluídos** e **7 itens abertos**. Ele é útil como histórico, mas não está suficientemente consolidado como backlog operacional.

## Pendências abertas

| Linhas | Tema | Estado | Recomendação |
|---:|---|---|---|
| 1416, 1878 | Chaves Stripe em Production | Bloqueado por acesso ao Vercel/Stripe | Consolidar em um único item e concluir somente após confirmar as chaves da conta correta no ambiente Production. |
| 1426 | Checkout Stripe e webhook | Bloqueado por configuração externa | Validar com uma nova sessão live gerada pelas chaves corretas; o link `cs_live_...` fornecido anteriormente não abriu no navegador de auditoria. |
| 1458 | Monitoramento Heartbeat | Aberto operacionalmente | Manter aberto até existir um log real de sucesso; os últimos registros consultados foram 404/403. |
| 2010, 2022 | Prévia/emissão autenticada dos três DOCX | Duplicado e dependente de sessão/mutação | Consolidar em um item e executar somente com confirmação explícita antes de criar certificados reais. |
| 2294 | Domínio próprio para Resend | Adiado pelo usuário | Reclassificar como “adiado — não bloqueante”; não exigir DNS enquanto o site usar o domínio padrão do Vercel. |

## Inconsistências encontradas

Há muitos blocos duplicados de “Ajustes”, “Conclusão” e “Refinamento”, especialmente para Google Calendar, Stripe, certificados e responsividade. As contagens de testes variam de 190 a 489 sem um registro canônico por commit e comando. Também existem afirmações fortes como “100% funcional”, “100% compatível” e “perfeito”, que deveriam ser substituídas por critérios verificáveis. Foi encontrada uma linha concatenada na região da linha 191, com dois itens unidos. O checklist mistura histórico, decisões, incidentes, deploys e backlog atual.

## Recomendação de governança

Preservar o histórico, mas criar uma seção curta “Estado atual — fonte de verdade” com baseline/deploy, teste/build, pendências técnicas, bloqueios externos e próxima ação. Consolidar duplicidades sem apagar o registro original e registrar cada validação com commit, comando, escopo e resultado. Não marcar automaticamente as pendências abertas como concluídas.

A auditoria não alterou banco, secrets, certificados reais ou pagamentos. O último estado funcional informado e verificado permanece na `main`, no commit `902739f`/`d6dbfe2` conforme o histórico operacional do projeto.
