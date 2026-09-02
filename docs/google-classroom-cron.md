# Sincronização diária do Google Classroom

O Vercel está configurado para chamar `GET /api/cron/classroom-sync` diariamente às 06:00 UTC (03:00 no horário de Brasília).

A rotina executa, em sequência, a sincronização de cursos, atividades, submissions e roster. O endpoint é protegido por `CRON_SECRET` e não aceita chamadas sem o header `Authorization: Bearer <CRON_SECRET>`.

Configure estas variáveis no ambiente **Production** do Vercel:

- `CRON_SECRET`: segredo aleatório forte usado pelo Vercel Cron.
- `CLASSROOM_SYNC_USER_ID`: ID numérico do administrador cuja conexão Classroom será sincronizada.

As variáveis Google e Neon já utilizadas pela aplicação também precisam estar disponíveis em Production. O cron não mantém tokens próprios: ele reutiliza a conexão Classroom persistida e criptografada no Neon.

A sincronização é somente leitura no Google Classroom e usa upsert nas tabelas locais. Em caso de erro, a rotina para na etapa que falhou e retorna o endpoint afetado no resultado da execução.
