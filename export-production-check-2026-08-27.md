# Verificação de exports — turmas externas

O deployment do commit `b514e03` foi consultado na Vercel e está em estado `READY` no alvo de produção.

A página `/professor/turmas-externas` foi recarregada após a publicação e carregou os controles de relatório acadêmico da turma Matutino, com 18 notas, além dos boletins PDF individuais na listagem de alunos. O fluxo não submeteu nenhuma exportação real nem alterou dados durante a verificação.

Foram implementados no código: CSV UTF-8 com BOM e separador `;` para melhor compatibilidade com Excel brasileiro; novo relatório acadêmico `.xlsx` com metadados, larguras de coluna, filtro automático, congelamento de cabeçalho e aba de instruções; modelo de importação Excel com aba de instruções; relatório PDF acadêmico em A4 paisagem com cabeçalho de marca, resumo visual, tabela com cabeçalho repetível e quebra segura; boletim individual em A4 retrato com cabeçalho, cartão de identificação e tabela zebrada.

Validação automatizada: TypeScript passou; contratos acadêmicos e visuais passaram com 14 testes; `git diff --check` passou. O build remoto Vercel concluiu com sucesso. O build local compilou e passou pelo lint, mas a coleta local de páginas foi interrompida pela ausência de `NEON_DATABASE_URL`/`DATABASE_URL`, limitação ambiental já conhecida.
