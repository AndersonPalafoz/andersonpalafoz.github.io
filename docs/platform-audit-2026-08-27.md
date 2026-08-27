# Auditoria da plataforma — 27/08/2026

## Superfícies públicas iniciais

A página inicial comunica com clareza o posicionamento de Anderson Palafoz e direciona para cursos e apresentação profissional. A navegação pública apresenta um conjunto conciso de destinos e a identidade institucional está consistente.

O catálogo de cursos oferece filtros por nível, tipo e categoria, além de busca. A auditoria identificou duas oportunidades de curadoria: o curso `English Mastery B2` ainda aparece, embora tenha sido apontado anteriormente como artefato técnico a ser removido, e dois cursos de letramento no nível B1 têm títulos/escopos semelhantes, o que pode gerar dúvida de escolha.

## Biblioteca e conteúdo editorial

A biblioteca permite pesquisa e filtros por nível e categoria. A área de materiais apresenta 4 itens cadastrados, mas inclui um segundo conjunto de guias autorais apresentado como conteúdo estático. Recomenda-se consolidar ambos em uma única fonte de catálogo ou rotulá-los explicitamente como coleção curada, preservando filtros e métricas consistentes.

O Blog possui busca e categoria, mas atualmente exibe apenas um artigo publicado. O melhor ganho de autoridade virá de uma cadência editorial mínima e de trilhas que conectem cada artigo a um material e a um curso relacionado.

## Jornada autenticada

O dashboard do aluno tem boa orientação por próximo passo, métricas acadêmicas e acesso direto à continuidade da aula. Na sessão auditada, a barra de progresso do curso no card de continuidade (9%) divergia do histórico acadêmico (0%). O fluxo deve usar uma fonte única de cálculo ou esclarecer a diferença entre progresso de aula e progresso consolidado.

O painel docente reúne muitas funções úteis, mas a página principal concentra busca global, gestão de materiais, cursos, tarefas e relatórios extensos. A recomendação é transformar os blocos abaixo do resumo em módulos recolhíveis ou priorizar, por padrão, a fila de decisões docentes. A mesma curadoria de cursos e a presença de registros externos com e-mail placeholder surgem nessa área; tais registros devem permanecer preservados até decisão explícita de saneamento.

## Operação e comunicação

O painel administrativo reúne controle de pendências, matriz de operações, moderação, indicadores, busca e comércio em uma única página. O conteúdo é funcional, mas sua altura e a repetição entre a Central de Pendências e a Matriz Operacional reduzem a velocidade de decisão. A priorização já iniciada no mobile deve continuar no desktop com uma visão resumida por padrão e detalhes sob demanda.

O formulário de contato declara corretamente que envia mensagens à central administrativa, mas a mesma página mantém CTAs proeminentes para e-mail. Caso a prioridade continue sendo concentrar as conversas no site, o formulário deve ganhar uma expectativa de resposta e acompanhamento na própria área, enquanto e-mail e WhatsApp passam a canais complementares.

## Confiabilidade e presença orgânica

O projeto Vercel oficial possui uma implantação de produção em estado `READY` na auditoria, mas os logs agregados dos últimos sete dias registram 38 grupos de erros históricos. Os mais frequentes envolveram cálculo de streak, tabelas ou colunas não existentes em funcionalidades de certificados, mensagens e turmas externas. A prioridade é separar correções já presentes na versão atual de erros ainda ativos, usando uma janela curta após cada deploy.

Uma consulta posterior de erros de execução com janela de uma hora não retornou ocorrências para a produção oficial. Assim, os erros agregados devem ser tratados como dívida técnica histórica a ser verificada novamente após mudanças nas áreas correspondentes, e não como indisponibilidade comprovada da implantação atual.

O `robots.txt` e o `sitemap.xml` apontam para `https://andersonpalafoz.github.io`, enquanto a URL pública auditada está em `https://andersonpalafoz.vercel.app`. A política de URL canônica, os metadados Open Graph e o sitemap devem convergir para um único domínio oficial antes de ampliar a produção editorial. Fontes: https://andersonpalafoz.vercel.app/robots.txt, https://andersonpalafoz.vercel.app/sitemap.xml e auditoria de produção Vercel em 27/08/2026.
