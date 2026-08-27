# Relatório da Fase 3 — Catálogo e detalhe do curso

A Fase 3 integrou ofertas publicadas à experiência de descoberta de cursos.

O catálogo agora consulta ofertas em lote para os cursos internos visíveis, filtrando `status = published` e `deletedAt IS NULL`. Cada cartão pode mostrar a quantidade de ofertas e até duas ofertas resumidas com nome e período acadêmico. Cursos sem ofertas continuam exibindo o cartão e o link legado `/cursos/{id}`.

A página de detalhe já carregava ofertas publicadas pelo serviço seguro `listPublishedCourseOffers`. Nesta fase, a integração foi consolidada com a apresentação no catálogo e a passagem do contexto ao `EnrollButton`. Falhas de leitura da nova tabela são tratadas como lista vazia, mantendo a página navegável em ambientes onde a migration ainda não foi aplicada.

A interface permanece responsiva com resumo vertical nos cartões e não expõe ofertas em rascunho ou arquivadas. A autorização de operações continua nos endpoints; o catálogo público recebe somente dados publicados.

Validação: TypeScript aprovado; 5 arquivos e 15 testes aprovados. Nenhum dado foi alterado e nenhuma publicação foi realizada automaticamente.

A próxima fase é integrar `offerId` ao dashboard do aluno, às rotas de aula, ao progresso e às atividades, evitando misturar duas ofertas do mesmo curso.
