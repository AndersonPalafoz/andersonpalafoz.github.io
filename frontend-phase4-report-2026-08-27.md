# Relatório da Fase 4 — Dashboard, aulas e progresso contextual

A Fase 4 integrou o `offerId` à navegação do aluno sem remover o fallback legado por `courseId`.

O helper `getUserEnrollments` agora consulta matrículas contextuais e adiciona `offerIds` agrupados por curso. O dashboard principal preserva o primeiro contexto de oferta nos links de acesso ao curso, permitindo que a página de detalhe selecione a coorte correta.

A página `app/cursos/[id]/page.tsx` aceita `searchParams.offerId`, valida o identificador, passa a oferta selecionada ao `EnrollButton` e mantém o contexto ao gerar links para as aulas.

A página de aula lê `offerId` da URL e o propaga para detalhe da aula, progresso, anotações, retorno ao curso e operações relacionadas. URLs antigas sem `offerId` permanecem válidas.

Validação: TypeScript aprovado; 5 arquivos e 15 testes focados aprovados. A primeira execução encontrou e corrigiu um erro de assinatura `searchParams` na página de detalhe. Nenhum dado foi alterado e nenhum deployment foi realizado automaticamente.

Limitação: o schema atual de progresso geral ainda é por curso/aula. O `offerId` já é preservado e enviado no contexto, mas a separação física do progresso por oferta dependerá de uma etapa posterior de modelo/endpoint, caso o mesmo aluno curse simultaneamente duas coortes do mesmo curso.
