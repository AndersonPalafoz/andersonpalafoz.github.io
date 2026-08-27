# Diagnóstico da Anderson Palafoz Platform e recomendações de melhoria

**Data da análise:** 27 de agosto de 2026  
**Escopo:** auditoria de leitura das superfícies pública, do aluno, do professor e administrativa; revisão de SEO, testes, dependências e telemetria de produção.  
**Limite:** nenhum dado, permissão, turma, aluno, nota, certificado ou configuração de produção foi alterado.

## Resumo executivo

A plataforma já apresenta uma identidade institucional coerente, navegação ampla, boa cobertura funcional e uma proposta pedagógica distinta, centrada em ESA, linguística aplicada e materiais autorais. A página inicial comunica valor de forma objetiva, os cursos e materiais são pesquisáveis, e as áreas autenticadas já oferecem continuidade de aprendizagem, controles administrativos e operações docentes. A implantação de produção estava em estado `READY` e não registrou erros na janela mais recente de uma hora. Contudo, os ganhos mais relevantes não estão em adicionar novos módulos: estão em consolidar o que existe, estabilizar a engenharia de qualidade e reduzir ambiguidades de conteúdo e de navegação. A suíte completa teve **567 testes aprovados e 29 falhos**, o que impede seu uso como barreira de regressão confiável. O audit de dependências de produção também identificou **3 vulnerabilidades altas e 1 moderada**. Para crescimento orgânico, a inconsistência de domínio entre `andersonpalafoz.vercel.app` e `andersonpalafoz.github.io` precisa ser corrigida antes de escalar o Blog. A recomendação central é priorizar confiabilidade, uma fonte única de progresso, curadoria do catálogo e interligação de conteúdo antes de ampliar funcionalidades.

> A prioridade da próxima etapa deve ser **tornar o ecossistema existente mais confiável, coerente e encontrável**, em vez de aumentar sua superfície funcional.

## Evidências e leitura do estado atual

| Dimensão | Evidência observada | Leitura |
|---|---|---|
| Proposta pública | A Home apresenta metodologia, níveis, cursos, certificação e rotas de continuidade. | A proposta de valor está clara e alinhada à marca acadêmica. |
| Cursos e materiais | Há busca e filtros nos dois catálogos. Os cursos apresentam nível, modalidade e preço/acesso. | A descoberta é funcional, mas a curadoria e a relação entre itens precisam ser mais explícitas. |
| Knowledge Hub | O Blog tem busca e categoria, porém somente um artigo publicado. | A arquitetura está pronta, mas a autoridade orgânica ainda depende de cadência e interligação editorial. |
| Jornada do aluno | O dashboard apresenta próximo passo, métricas e histórico. | A experiência é promissora, mas há divergência entre progresso de continuidade e histórico. |
| Jornada docente e administrativa | Os painéis concentram operações reais, busca e indicadores. | A capacidade é ampla; a densidade atual reduz velocidade de decisão e aumenta repetição visual. |
| Produção | O projeto oficial estava `READY`; a janela de uma hora não retornou erros de runtime. | A produção parece estável no momento da leitura; os erros antigos ainda formam dívida técnica. |
| Testes | `pnpm vitest run`: 567 aprovados e 29 falhos, distribuídos em 16 arquivos. | A suíte global exige saneamento antes de voltar a ser usada como gate de entrega. |
| Dependências | `pnpm audit --prod`: 3 altas e 1 moderada, envolvendo `xlsx`, `nanoid` e `postcss`. | O fluxo de importação e o grafo de dependências exigem atualização planejada e testes de regressão. |
| Analytics | A consulta agregada de visitas retornou 0 visitantes e 0 pageviews na janela disponível. | Não é possível priorizar por comportamento real ainda; é preciso verificar se a coleta está ativa e instrumentada. |

## Recomendações priorizadas

| Prioridade | Melhoria recomendada | Por que importa | Primeiro resultado verificável |
|---|---|---|---|
| **P0** | Recuperar a integridade da suíte de testes. | Falhas em rotas administrativas, usuários, navegação, certificados e Turmas Externas reduzem a confiança a cada entrega. | `pnpm vitest run` finaliza sem falhas, com mocks de sessão/requisição corretos e contratos atualizados. |
| **P0** | Atualizar ou substituir o caminho de importação baseado em `xlsx` e revisar `nanoid`/`postcss`. | Dependências vulneráveis são risco direto, especialmente ao processar planilhas recebidas de terceiros. | `pnpm audit --prod` sem vulnerabilidades altas exploráveis no fluxo de importação. |
| **P0** | Definir um domínio público canônico e alinhar `metadataBase`, Open Graph, `robots.txt` e sitemap. | Atualmente o sitemap e robots usam o domínio GitHub Pages, enquanto o site em produção está no domínio Vercel. Isso divide sinais de indexação. | Todas as URLs canônicas e o sitemap apontam para um único domínio publicado. |
| **P1** | Criar uma fonte única de verdade para o progresso. | O card de retomada exibiu 9%, enquanto o histórico mostrou 0% para o mesmo curso. Isso é pedagogicamente confuso. | Dashboard, histórico, certificados e relatórios exibem o mesmo percentual, com critério documentado. |
| **P1** | Fazer curadoria explícita do catálogo de cursos. | Há dois cursos B1 de letramento com escopos próximos e um curso `English Mastery B2` com rótulo de nível B1/modalidade externa que merece confirmação editorial. | Cada curso possui proposta, público, modalidade e diferencial inequívocos; nenhum registro ambíguo aparece no catálogo. |
| **P1** | Reduzir a densidade das homepages de professor e administração. | Os painéis reúnem múltiplos blocos extensos, inclusive informações repetidas entre pendências, matriz operacional e busca. | Tela inicial mostra fila prioritária e ações frequentes; módulos secundários passam a abrir sob demanda. |
| **P1** | Ocultar identidades `@external.placeholder` das buscas gerais sem apagá-las. | Registros técnicos preservados aparecem em áreas operacionais e prejudicam a leitura do painel. | Busca administrativa e docente exibem somente pessoas acionáveis; os registros permanecem preservados no banco. |
| **P1** | Integrar Blog, materiais e cursos por relações explícitas. | A estratégia da plataforma exige que cada conteúdo leve logicamente ao próximo recurso pedagógico. | Todo artigo aponta para ao menos um material e curso; materiais indicam contexto de uso. |
| **P2** | Consolidar o formulário como canal principal de contato no site. | A página informa que as mensagens chegam à central administrativa, mas mantém e-mail como CTA equivalente. | Confirmação de envio, prazo de resposta e status da conversa ficam claros dentro da plataforma. |
| **P2** | Instrumentar analytics orientado a decisão. | Sem dados de visitas, não há evidência para priorizar páginas, CTAs e conteúdos por uso. | Painel mensal com visitantes, páginas/recursos mais acessados, inscrições e conversões de contato. |

## Melhorias por área

### Área pública e aquisição

A Home comunica a proposta de forma eficaz, mas pode converter melhor se as chamadas à ação forem mais contextuais. Recomenda-se relacionar o CTA principal ao nível ou objetivo do visitante — por exemplo, “Quero destravar a leitura acadêmica” ou “Quero começar do zero” — e levar cada escolha a uma trilha curada, não apenas ao catálogo completo. A página **Sobre** é forte em credenciais e pesquisa; pode transformar sua autoridade em conversão ao conectar cada área de interesse a uma aula, material ou artigo exemplar.

Na camada editorial, a principal lacuna é volume estruturado, não interface. Um primeiro ciclo de quatro artigos densos, cada um associado a um material gratuito e a um curso, já permitiria iniciar uma rede coerente de conteúdo. Temas especialmente alinhados ao posicionamento atual incluem leitura acadêmica em inglês, ensino de morfossintaxe, práticas ESA e letramento étnico-racial mediado por recursos visuais.

### Área do aluno

O dashboard deve continuar a operar como uma agenda de aprendizagem, não como painel de métricas. O card **Continuar aprendendo** é a melhor unidade de foco e deve prevalecer sobre estatísticas. A primeira correção é unificar o cálculo de progresso. Depois, recomenda-se acrescentar uma explicação curta de “como avançar” quando o progresso estiver baixo, conectando a próxima aula, uma atividade e o critério de conclusão do certificado. As notificações de medalhas recém-implementadas devem continuar como reconhecimento contextual e discreto, sem XP, moedas ou rankings.

### Área do professor

O painel docente é rico, mas sua página inicial tende a se comportar como um repositório de ferramentas. A recomendação é orientar o professor por três perguntas: **o que precisa de correção hoje**, **quais turmas exigem atenção** e **qual conteúdo precisa ser publicado ou revisado**. Materiais, cursos, lixeira e exportações podem continuar acessíveis, mas fora da primeira dobra por padrão. Isso reduz carga cognitiva e preserva a velocidade no celular.

### Administração e superadministração

O painel administrativo já possui boa cobertura de tarefas e permissões. A melhoria mais importante é substituir repetição por síntese: a **Central de Pendências** deve ser a entrada operacional; a matriz de capacidades deve servir como referência expansível; e os blocos de comércio, auditoria e busca devem ser contextualizados por necessidade. Para o superadmin, uma página de governança mensal separada — com indicadores acadêmicos, conteúdo publicado, saúde técnica e pendências de segurança — seria mais útil do que concentrar tudo na home do painel.

## Roteiro de execução sugerido

| Ordem | Entrega | Escopo seguro |
|---|---|---|
| 1 | Estabilização de qualidade | Corrigir testes, mocks e contratos sem mutar dados reais. |
| 2 | Segurança de dependências | Atualizar o parser de planilhas e validar importação com arquivos controlados. |
| 3 | SEO e domínio | Escolher e configurar uma URL canônica; regenerar sitemap e metadados. |
| 4 | Progresso acadêmico | Consolidar o cálculo de progresso em uma fonte de verdade e cobrir com testes. |
| 5 | Curadoria de catálogo | Confirmar cursos ambíguos com o responsável e corrigir rótulos, relações e visibilidade sem exclusão automática. |
| 6 | Simplificação de painéis | Reorganizar as páginas iniciais de professor/admin por fila de decisão e blocos sob demanda. |
| 7 | Conteúdo e métricas | Publicar a primeira trilha editorial e confirmar a coleta de analytics antes de medir conversão. |

## Indicadores de sucesso

O sucesso técnico da próxima etapa será uma suíte integralmente verde, nenhuma vulnerabilidade alta no audit de produção e metadados apontando para um domínio único. O sucesso pedagógico será a consistência do progresso percebido pelo aluno e a redução de tarefas administrativas necessárias para o professor localizar pendências. O sucesso de crescimento será medido por visitantes, páginas de curso e material mais acessadas, envios de contato, cadastros e alunos ativos — evitando contadores genéricos ou métricas de vaidade.

## Referências

[1]: https://andersonpalafoz.vercel.app/ "Página inicial da Anderson Palafoz Platform"
[2]: https://andersonpalafoz.vercel.app/cursos "Catálogo público de cursos"
[3]: https://andersonpalafoz.vercel.app/materiais "Biblioteca pública de materiais"
[4]: https://andersonpalafoz.vercel.app/blog "Knowledge Hub e Blog"
[5]: https://andersonpalafoz.vercel.app/contato "Página de contato"
[6]: https://andersonpalafoz.vercel.app/robots.txt "Arquivo robots.txt publicado"
[7]: https://andersonpalafoz.vercel.app/sitemap.xml "Sitemap XML publicado"
[8]: https://github.com/advisories/GHSA-4r6h-8v6p-xvw6 "Advisory de segurança do SheetJS/xlsx"
