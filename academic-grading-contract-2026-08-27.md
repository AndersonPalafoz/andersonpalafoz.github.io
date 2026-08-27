# Contrato acadêmico comum — Fase 3

## Objetivo

Cursos internos e ofertas externas devem consumir o mesmo contrato de cálculo, mas declarar explicitamente a política acadêmica. O cálculo não deve depender da página que o chamou nem de inferência frágil pelo nome do curso.

## Políticas

| Política | Uso | Regra |
|---|---|---|
| `standard` | Cursos internos comuns | Média das notas válidas, com média mínima configurável |
| `unit` | Cursos com unidades | Cada unidade precisa cumprir sua média mínima quando o escopo for unitário |
| `simal` | Ofertas SIMAL | Prova escrita até 8,0 + apresentação até 2,0 |

## Regras invariantes

A normalização aceita ponto ou vírgula decimal, preserva zero, rejeita valores não numéricos e impede nota acima do máximo. Médias são arredondadas a uma casa decimal somente na apresentação do resultado. Valores persistidos devem manter precisão suficiente para auditoria.

A situação pode ser `approved`, `failed` ou `pending`. `pending` é obrigatório quando faltam componentes necessários, quando a oferta ainda está aberta ou quando a frequência não pode ser calculada. Uma média manual válida substitui somente a média final do aluno e sempre deve carregar justificativa, usuário e data.

## SIMAL

A política SIMAL deve continuar aceitando notas totais da prova até 8,0, componentes escritos normalizados para sua escala e apresentação até 2,0. Registros mais recentes do mesmo componente vencem versões anteriores conforme o timestamp. A situação não pode ser marcada como final enquanto prova ou apresentação obrigatória estiver ausente.

## Integração futura

O contrato deverá ser usado por APIs, página docente, boletim, relatório CSV/XLSX/PDF, gráfico comparativo, dashboard do aluno e certificados. O próximo passo de implementação é criar uma função de resultado acadêmico que combine cálculo de nota e frequência, com testes de paridade para os dados SIMAL existentes e testes de contrato para cursos internos.
