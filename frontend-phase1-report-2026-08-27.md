# Relatório da Fase 1 — Implantação frontend

A Fase 1 criou os contratos frontend independentes do schema Drizzle, um cliente HTTP tipado para ofertas/coortes e a feature flag pública `NEXT_PUBLIC_COURSE_OFFERS_ENABLED`.

Foram adicionados `lib/course-offer-types.ts`, `lib/course-offer-client.ts`, `lib/course-offer-feature.ts` e `lib/course-offer-client.test.ts`. O cliente centraliza listagem, criação, leitura, atualização, arquivamento, restauração, professores e alunos. Erros HTTP são expostos como `CourseOfferApiError` com status e mensagem.

A flag permite ativação explícita por prop, por variável pública ou, na ausência de configuração, pelo fallback `hasOffers`. Ela controla apenas a exposição de UI; autorização continua exclusivamente nos endpoints do servidor.

A validação TypeScript passou e os testes de contratos do cliente, migrador e matrícula passaram com 3 arquivos e 11 testes. Nenhum dado de banco foi alterado e nenhuma publicação foi feita.

A próxima etapa é integrar o cliente e a flag ao fluxo de matrícula/checkout e ao detalhe do curso, substituindo gradualmente chamadas `fetch` duplicadas sem remover o fallback legado.
