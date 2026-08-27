# Relatório da Fase 2 — Matrícula e checkout contextual

A Fase 2 integrou o cliente HTTP tipado ao `EnrollButton` e transportou `offerId` pelo fluxo gratuito e pago.

No fluxo gratuito, `POST /api/enrollments` valida que a oferta pertence ao curso, está publicada e não foi excluída. O registro legado em `enrollments` continua sendo mantido para compatibilidade, enquanto `course_offer_students` recebe a matrícula contextual. O `GET /api/enrollments` agora devolve `offerIds` por curso.

No fluxo pago, `POST /api/stripe/checkout` valida a oferta e envia `offer_id` no metadata da sessão Stripe. O webhook repassa esse identificador ao fulfillment, que cria a matrícula contextual após o pagamento confirmado.

O `EnrollButton` usa `enrollInCourse` e `startCourseCheckout` do cliente tipado, converte erros HTTP em mensagens de interface e respeita `NEXT_PUBLIC_COURSE_OFFERS_ENABLED`. Quando a flag está desligada ou não existem ofertas, o fluxo legado permanece ativo.

Validação: TypeScript aprovado; 6 arquivos e 15 testes focados aprovados. Nenhuma migration ou operação em banco real foi executada nesta sessão.

Checkpoint: alterações ainda aguardam commit e publicação após revisão do responsável pelo rollout.
