# Plano Estratégico de Implementação e Auditoria: Os Cinco Tipos de Curso

**Autor:** Manus AI  
**Revisor:** Anderson Palafoz  
**Plataforma:** Anderson Palafoz Platform  
**Data:** Agosto de 2026  
**Status:** Plano Operacional Oficial  

---

## 1. Visão Geral e Alinhamento Estratégico

Este documento estabelece o plano estratégico e detalhado para auditar, refinar e consolidar a operação dos **cinco tipos de curso** definidos na especificação pedagógica (`TIPOS_DE_CURSOS_ESPECIFICACAO.md`). O objetivo principal é alinhar a infraestrutura técnica atual (Next.js 15, Drizzle ORM, Neon PostgreSQL, RBAC de autoria e Painel Administrativo/Professor) às exigências comerciais e pedagógicas de cada modalidade de ensino.

A plataforma opera sob um modelo de alta governança onde o professor Anderson Palafoz possui controle total sobre a criação, edição, exclusão lógica (lixeira de 30 dias) e restauração de conteúdos. Com base nas páginas e rotas já existentes, o plano a seguir divide a execução em quatro fases operacionais claras.

---

## 2. Mapeamento de Rotas e Estado Atual das Páginas

Para assegurar uma transição sem atritos e corrigir eventuais gargalos de navegação, o ecossistema atual está mapeado na tabela abaixo, indicando o relacionamento com os cinco tipos de curso:

| Módulo do Sistema | Rota Principal | Funcionalidade Atual | Alinhamento com os 5 Tipos de Curso |
| :--- | :--- | :--- | :--- |
| **Vitrine Pública** | `/` | Apresentação institucional e diferenciais | Vitrine para Tipo 1, Tipo 2, Tipo 3 e Tipo 5. |
| **Catálogo de Cursos** | `/cursos` | Listagem pública com filtros de nível | Exibição unificada com etiquetas e cores para diferenciar as 5 modalidades. |
| **Detalhes do Curso** | `/cursos/[id]` | Página de vendas e visualização de módulos | Inclusão de blocos específicos para links do Drive (Tipo 1) e agendamento (Tipo 5). |
| **Painel do Professor** | `/professor` | Resumo estatístico e atalhos | Gestão de turmas, materiais e cursos com restrição de autoria. |
| **Turmas Externas** | `/professor/turmas-externas` | Gestão de turmas de organizações parceiras | Dedicado exclusivamente ao **Tipo 4 (Cursos Externos / Corporativos)**. |
| **Progresso e Aulas** | `/professor/progresso-aulas` | Acompanhamento de desempenho discente | Monitoramento de notas e frequências (Tipos 1, 2, 3 e 4). |
| **Gestão Administrativa** | `/admin/cursos` | Administração global de conteúdos e lixeira | Auditoria e governança total sobre todos os 5 tipos de curso. |

---

## 3. Fases do Plano Estratégico de Implementação

### Fase 1: Auditoria de Banco de Schema e Metadados (Semana 1)
* **Objetivo:** Garantir que a tabela de cursos no banco de dados (`drizzle/schema.ts`) suporte nativamente os metadados específicos exigidos pelos cinco tipos de curso.
* **Ações Práticas:**
  1. Adicionar o campo `courseType` (enum ou integer de 1 a 5) na tabela de cursos.
  2. Incluir campos complementares para links de redirecionamento externo (Hotmart/Classroom) e metadados de agendamento presencial.
  3. Validar a integridade das migrações SQL no Neon PostgreSQL e a execução dos testes automatizados em Vitest.

### Fase 2: Refinamento da Interface Pública e Sinalização Visual (Semana 2)
* **Objetivo:** Tornar a distinção entre as cinco modalidades visualmente evidente e intuitiva para os alunos na vitrine e no catálogo.
* **Ações Práticas:**
  1. Atualizar os cards de cursos em `/cursos` e na página inicial para exibir as tags coloridas oficiais:
     * *Tipo 1 (EAD Fechado):* Azul Sólido (`[EAD Fechado]`).
     * *Tipo 2 (Híbrido):* Verde Esmeralda (`[Híbrido / Encontros]`).
     * *Tipo 3 (Particular):* Roxo Escuro (`[Particular Customizado]`).
     * *Tipo 4 (Externo/Corporativo):* Âmbar (`[Externo / Corporativo]`).
     * *Tipo 5 (Presencial & Agendamento):* Vermelho Institucional (`[Presencial & Agendamento]`).
  2. Implementar filtros rápidos no topo do catálogo para que os alunos possam alternar instantaneamente entre as modalidades.

### Fase 3: Otimização dos Fluxos de Conversão e Atendimento (Semana 3)
* **Objetivo:** Direcionar o usuário para a jornada correta conforme o tipo de curso escolhido.
* **Ações Práticas:**
  1. **Para Tipo 1 e Tipo 2:** Integrar o fluxo de matrícula direta (gratuita ou via Stripe) com redirecionamento automático para a área do aluno ou link externo autorizado.
  2. **Para Tipo 3 e Tipo 5:** Substituir botões de checkout por chamadas à ação (CTAs) de contato direto via WhatsApp e formulário de agendamento em Salvador/BA.
  3. **Para Tipo 4:** Garantir que o painel de turmas externas (`/professor/turmas-externas`) exiba corretamente a listagem de alunos, boletins e lançamentos em lote.

### Fase 4: Governança, Testes de Regressão e Homologação (Semana 4)
* **Objetivo:** Consolidar a estabilidade do sistema, garantindo que o RBAC e as regras de exclusão/lixeira operem sem falhas.
* **Ações Práticas:**
  1. Executar a bateria completa de testes em Vitest para validar a criação, edição, soft delete e restauração em lote de cursos de todas as categorias.
  2. Realizar auditoria de responsividade mobile-first em todas as subpáginas do professor e do administrador.
  3. Gerar o checkpoint final no sistema e preparar a liberação para homologação do usuário.

---

## 4. Critérios de Sucesso e Métricas de Acompanhamento

A implementação bem-sucedida deste plano será medida através dos seguintes indicadores objetivos:
* **Clareza de Navegação:** Redução a zero de dúvidas de usuários quanto ao modelo de atendimento de cada curso (acesso assíncrono vs. encontros síncronos).
* **Integridade dos Dados:** 100% de conformidade nas restrições de autoria de professor versus acesso global de administrador.
* **Estabilidade Técnica:** Manutenção de 100% de aprovação na suíte de testes automatizados (Vitest) e ausência de erros 500 nas rotas de API.

---
*Plano estratégico elaborado para a Plataforma Anderson Palafoz.*


---

## 5. Log de Execução e Atualizações Contínuas

* **[Concluído]** Criação do documento de especificação técnica dos cinco tipos de curso (`TIPOS_DE_CURSOS_ESPECIFICACAO.md`).
* **[Concluído]** Auditoria de schema e inclusão das colunas `course_type`, `external_redirect_url` e `sync_modality` no banco de dados Neon PostgreSQL e Drizzle ORM (`drizzle/schema.ts`).
* **[Em Andamento]** Atualização do formulário administrativo de cursos (`app/admin/cursos/page.tsx`) e da listagem para permitir definir o tipo de curso, o link externo e a modalidade síncrona.
* **[Próximo Passo]** Refinar as páginas públicas de listagem e detalhe de cursos (`/cursos` e `/cursos/[id]`) para exibir as tags coloridas oficiais, o link de redirecionamento externo (para cursos do Tipo 1 e Tipo 4) e as informações de agendamento (Tipo 5).

### Atualização de execução — 20/08/2026

A camada compartilhada `lib/course-types.ts` foi criada com a taxonomia oficial, rótulos, cores, descrições, modalidades síncronas e validações de URL. O formulário administrativo em `app/admin/cursos/page.tsx` agora permite criar e editar o tipo do curso, a URL externa e a modalidade de atendimento, com bloqueio de encontros síncronos para o Tipo 1 e mensagens de validação.

A API administrativa e as funções de persistência em `app/api/admin/courses/route.ts` e `lib/db.ts` foram alinhadas para validar e gravar os campos novos, mantendo as regras de RBAC existentes e respostas com códigos de erro. As listagens administrativas passaram a exibir a tag do tipo e a modalidade.

O catálogo público em `/aulas` e a página pública de detalhe em `/cursos/[id]` foram atualizados. O catálogo possui filtro por tipo e tags coloridas; o detalhe apresenta a descrição da modalidade, a forma de atendimento, o acesso a ambiente externo autorizado quando aplicável e o CTA de contato para o Tipo 5.

Durante a primeira validação, a suíte detectou que o ambiente de desenvolvimento ainda não possuía as três colunas embora o código já as consultasse. A migração idempotente foi reaplicada no banco de desenvolvimento e o schema Drizzle confirmou que não há uma nova migração pendente. Também foi preservado o contrato de acessibilidade existente para a origem “Curso interno”.

**Próximas ações:** executar novamente os 325 testes, validar o build de produção, revisar a responsividade das páginas `/aulas`, `/cursos/[id]` e `/admin/cursos`, e só então marcar esta etapa como concluída no `todo.md` e salvar o checkpoint.

### Diagnóstico adicional de compatibilidade

A suíte Vitest passou em **323 de 325 testes** após a correção do contrato de acessibilidade e dos testes unitários dos tipos. Os dois testes restantes falham porque o DSN `NEON_DATABASE_URL` usado pelo processo local aponta para um banco PostgreSQL em que a tabela `courses` ainda tem 26 colunas e não contém `course_type`, `external_redirect_url` e `sync_modality`. A execução pelo painel de banco foi concluída em outra conexão de desenvolvimento, mas o processo local e os testes continuam apontando para o banco `neondb` no endereço local mascarado pelo ambiente.

A tentativa de executar `pnpm db:migrate` não foi aplicada porque o histórico de migrações desse DSN não corresponde ao banco existente: a primeira migração tenta recriar tabelas que já existem. Portanto, não será feita uma migração ampla ou destrutiva. O próximo passo seguro é alinhar o DSN de desenvolvimento ao banco que recebeu a alteração ou executar somente uma migração de reparo idempotente nesse banco específico, depois validar novamente as 325 verificações. Até essa sincronização, a implementação de frontend e backend está pronta, mas o checkpoint final não deve ser salvo como homologado.

### Conclusão da Auditoria de Banco de Dados

O teste efetuado diretamente no DSN configurado no ambiente atual confirmou que a tabela `courses` possui atualmente 26 colunas e ainda não contém as colunas `course_type`, `external_redirect_url` e `sync_modality`. Como este é o banco ativo nas variáveis do projeto, os testes que consultam a listagem de cursos falham por falta dessas colunas.

Para solucionar definitivamente o problema apontado nos testes e garantir que o ambiente local e o Vercel operem com a mesma estrutura sem erros 500 ou colunas ausentes, aplicarei imediatamente o comando SQL idempotente para adicionar as três colunas neste mesmo banco. Em seguida, reexecutarei toda a suíte de testes Vitest para validar a aprovação de 100% dos testes.

## Fase 2: Refinamento da Vitrine Pública e Experiência do Visitante

### Objetivo
Consolidar a experiência visual e interativa dos cinco tipos de curso na vitrine pública (`/aulas`, `/cursos/[id]` e páginas institucionais), garantindo que visitantes e alunos identifiquem imediatamente a modalidade, regras de acesso, formas de atendimento e canais de contato, em conformidade estrita com o Design System da plataforma.

### Tarefas da Fase 2
1. **Legenda Interativa de Modalidades**: Adicionar um painel explicativo e colapsável na página de catálogo (`/aulas`) descrevendo detalhadamente os cinco tipos de curso (EAD Fechado, Híbrido, Particular, Externo/Corporativo e Presencial/Agendamento).
2. **Filtros Avançados por Tipo de Curso**: Estender o catálogo público com botões de filtro rápido no topo da listagem para permitir que o usuário filtre os cursos por tipo (ex: apenas EAD, apenas Híbrido, apenas Particulares ou Presenciais).
3. **Melhorias de Acessibilidade e Contraste**: Garantir que todas as tags coloridas de tipo e modalidade atendam aos critérios WCAG AA com contraste adequado nos modos claro e escuro.
4. **Seção de Chamada para Ação para Aulas Presenciais e Particulares**: Otimizar o bloco de CTA nas páginas de cursos dos tipos 3 e 5 para direcionar o interessado diretamente ao canal de contato institucional ou agendamento.
5. **Testes Unitários e Validação de Regressão**: Criar novos testes Vitest cobrindo os filtros da vitrine pública e assegurar que toda a suíte permaneça 100% aprovada.

### Resultados da Fase 2 (Refinamento da Vitrine Pública)

1. **Legenda Interativa (`CourseTypeLegend`)**: Criado e integrado no topo da página `/aulas`. Exibe em formato de cards acessíveis os cinco tipos de curso com seus respectivos ícones, cores institucionais do Design System e descrições claras para o visitante.
2. **Filtros Rápidos por Tipo**: Adicionados botões de filtro rápido baseados nos 5 tipos na barra de pesquisa da vitrine pública, permitindo que o usuário alterne instantaneamente entre modalidades com suporte a aria-pressed.
3. **CTAs Contextuais**: As páginas individuais de detalhes (`/cursos/[id]`) agora adaptam os botões de ação com base na modalidade (redirecionamento para Hotmart/Classroom para os tipos 1 e 4; direcionamento para contato/agendamento com parâmetro do curso para os tipos 3 e 5).
4. **Testes Unitários**: Criado o arquivo `app/course-types-public.test.ts` validando a presença da legenda, filtros rápidos e CTAs específicos. A suíte completa de testes passou com **328 testes aprovados (100% de sucesso)**.

### Melhoria complementar — Feedback de redirecionamento externo

Foi criado o componente client-side `components/external-course-cta.tsx` e integrado à página pública `app/cursos/[id]/page.tsx`. Quando o usuário clica em um CTA de ambiente externo dos Tipos 1 ou 4, o botão muda imediatamente para o estado **“Abrindo ambiente externo...”**, mostra um indicador de carregamento e informa via região `aria-live` que o destino será aberto em uma nova aba. Cliques duplicados são bloqueados durante o estado de transição, enquanto o link mantém `target="_blank"` e `rel="noopener noreferrer"`.

O teste de contrato `components/external-course-cta.test.ts` confirma o destino em nova aba, os atributos de segurança, o feedback textual, o estado `aria-disabled` e a região acessível de status. A suíte passou com **329 testes aprovados**. A validação do build permanece pendente porque o worker do Next.js foi encerrado pelo limite de recursos do sandbox em tentativas anteriores; isso não gerou erro de TypeScript no servidor reiniciado.

### Validação de build após os CTAs externos

O build de produção foi executado com sucesso após liberar processos concorrentes do sandbox e executar o Next.js 15 com um worker controlado. A compilação concluiu sem erros de TypeScript ou de módulos, e as rotas `/aulas` e `/cursos/[id]` foram geradas no relatório final do build. O encerramento anterior do worker foi confirmado como limitação de memória do ambiente, não como falha introduzida pelo componente `ExternalCourseCta`.

---

## Fase 3: Otimização dos Fluxos de Conversão e Atendimento

### Objetivo
Garantir que os usuários sejam direcionados à jornada e ao canal de conversão corretos com base no tipo de curso selecionado, integrando matrículas diretas, redirecionamento para plataformas parceiras, agendamentos presenciais e relatórios institucionais.

### Tarefas da Fase 3
1. **Refinamento do Fluxo de Matrícula para Tipos 1 e 2**:
   * Assegurar que cursos EAD fechados e híbridos ofereçam matrícula automática (gratuita ou paga via Stripe) com liberação imediata de acesso na área do aluno.
   * Quando houver URL externa cadastrada, exibir o botão de acesso com o componente de feedback visual (`ExternalCourseCta`).
2. **Integração de Contato Direto para Tipos 3 e 5 (Particulares e Presenciais)**:
   * Conectar a página de contato e agendamento (`/contato`) ao ID e título do curso selecionado, permitindo pré-preenchimento automático da mensagem para aulas presenciais em Salvador ou percursos particulares customizados.
3. **Validação do Painel de Turmas Externas para o Tipo 4**:
   * Auditar a rota `/professor/turmas-externas` e as listagens de alunos para confirmar a exibição correta de turmas corporativas e institucionais (UFBA, SIMAL), com suporte a lançamentos em lote e exportação de boletins em PDF.
4. **Testes de Integração e Regressão**:
   * Criar cenários de teste automatizados em Vitest para os novos fluxos de conversão da Fase 3 e validar a ausência de regressões no build de produção.

### Início da Fase 3 — Primeira entrega: contato contextual para Tipos 3 e 5

A primeira entrega da Fase 3 foi iniciada e concluída no fluxo de contato. A página `app/contato/page.tsx` agora aceita o parâmetro público `curso`, consulta o curso persistido por `getCourseById` e só ativa o contexto quando o registro real pertence ao Tipo 3 (Particular) ou ao Tipo 5 (Presencial). O formulário recebe o título e o ID do curso, apresenta um aviso de contextualização e pré-preenche assuntos e mensagens específicos, mantendo o usuário livre para revisar o texto antes de abrir o aplicativo de email.

O componente `ContactForm` passou a aceitar `courseContext` opcional e ganhou os assuntos válidos **“Aulas particulares personalizadas”** e **“Agendamento de aula presencial”**. A página pública de detalhes continua enviando apenas o ID do curso no CTA (`/contato?curso=...`), evitando confiar em títulos ou modalidades manipulados no navegador.

Durante a validação, foram corrigidos dois pontos de compatibilidade: o teste de renderização passou a aguardar a página assíncrona do App Router, e o teste de pré-preenchimento passou a usar asserções compatíveis com a configuração Vitest existente. Resultado atual: **331 testes aprovados em 96 arquivos**.

**Próximas tarefas da Fase 3:** validar a jornada de matrícula dos Tipos 1 e 2 sem modificar a política de pagamento; auditar a listagem e os relatórios de Tipo 4 em `/professor/turmas-externas`; e criar cenários de regressão para as três jornadas.

### Validação de Checkout e Conversão (Tipos 1 e 2)

A auditoria dos fluxos de pagamento e matrícula para **Cursos Fechados (Tipo 1)** e **Híbridos (Tipo 2)** confirmou a robustez dos endpoints:
1. **Proteção de Cursos Gratuitos**: A rota `/api/stripe/checkout` rejeita explicitamente tentativas de checkout em cursos marcados como gratuitos (`isFree: true`), orientando o aluno para a matrícula direta.
2. **Criação de Sessão e Preços**: Para cursos pagos, o gateway garante a criação ou recuperação do preço no Stripe e gera a sessão de pagamento com metadados vinculados ao ID do usuário e do curso.
3. **Cumprimento de Compra (*Fulfillment*)**: O webhook do Stripe (`/api/stripe/webhook`) e a função `fulfillCoursePurchase` registram a transação na tabela `coursePurchases` de forma idempotente e criam automaticamente a matrícula ativa na tabela `enrollments` caso ainda não exista.
4. **Testes automatizados**: O arquivo `app/api/stripe/checkout-types.test.ts` foi criado para certificar os contratos de checkout e webhooks. A suíte completa passou com **333 testes aprovados**.

### Filtros Administrativos por Tipo de Curso e Modalidade

Para agilizar a gestão e o controle pedagógico no painel administrativo (`/admin/cursos`), foram implementados seletores combináveis de **tipo de curso** e **modalidade síncrona**:
1. **Seletores Dedicados**: O cabeçalho de listagem foi estendido com dois filtros select adicionais (Tipo de Curso e Modalidade de Atendimento), integrados à barra de busca por texto e ao filtro de nível.
2. **Filtragem Reativa**: O gancho `useMemo` agora avalia simultaneamente o texto de busca, o nível, o tipo numérico do curso (`courseType`) e a modalidade de atendimento (`syncModality`), garantindo precisão instantânea.
3. **Limpeza e Feedback**: Quando qualquer filtro está ativo, aparece um botão de redefinição rápida (“Limpar filtros”) acompanhado de contadores reativos de itens exibidos.
4. **Testes automatizados**: Criado o teste de contrato `app/admin/cursos/admin-filters.test.ts`. A suíte completa passou com **334 testes aprovados**.

---

## Conclusão da Fase 3

A **Fase 3** foi concluída com sucesso. Os fluxos de conversão e atendimento foram otimizados e validados por testes automatizados:
1. **Contato Contextual (Tipos 3 e 5)**: A página `/contato` recebe o parâmetro de URL `?curso=...`, recupera o curso persistido e pré-preenche o assunto e a mensagem para percursos particulares e agendamentos presenciais.
2. **Checkout e Conversão (Tipos 1 e 2)**: Os pagamentos e matrículas para cursos EAD fechados e híbridos foram auditados, assegurando proteção contra itens gratuitos e fulfillment idempotente via webhook.
3. **Turmas Externas e Corporativas (Tipo 4)**: A rota `/professor/turmas-externas` opera com filtros por ano e semestre letivo, matrículas institucionais (UFBA e SIMAL) e relatórios validados.

---

## Fase 4: Governança, Testes de Regressão e Homologação

### Objetivo
Consolidar a estabilidade estrutural da plataforma, assegurando que as regras de controle de acesso baseado em papéis (RBAC) por autoria, a lixeira de 30 dias com exclusão automática e as listagens administrativas e de professor operem sem regressões, validadas por uma suíte de testes robusta.

### Tarefas da Fase 4
1. **Auditoria de RBAC por Autoria e Globais**:
   * Garantir que professores gerenciem estritamente seus próprios itens enquanto administradores mantenham acesso irrestrito.
2. **Homologação da Lixeira e Retenção de 30 Dias**:
   * Verificar contadores em tempo real, restauração em lote, exclusão definitiva e esvaziamento seguro protegido por modal de confirmação.
3. **Bateria Completa de Regressão e Build**:
   * Executar a suíte completa de testes Vitest e validar o build de produção do Next.js 15 sem erros de compilação.

### Primeira Entrega da Fase 4 — Governança de Materiais e Contraste no Contato

A revisão da Fase 3 confirmou a conclusão dos fluxos de contato contextual, checkout dos Tipos 1 e 2 e auditoria das turmas externas do Tipo 4. Com isso, a Fase 4 foi iniciada pela auditoria de autoria dos materiais e pela correção de legibilidade apontada na página de contato.

A auditoria encontrou uma lacuna objetiva: a tabela `materials` não possuía um identificador persistente de autoria, enquanto `canManageMaterial` permitia que qualquer professor gerenciasse materiais sem verificar o criador. A correção adicionou `instructorId` ao schema e ao banco Neon ativo, restringiu listagens normais e da lixeira ao professor autenticado, vinculou novos materiais ao professor que os cria e passou a exigir verificação de autoria nas edições, restaurações e exclusões. Administradores e superadministradores continuam com escopo global.

Também foi corrigido o contraste no modo escuro de `/contato` e `ContactForm`: fundos, textos, rótulos, campos, placeholders, cartões e estados de sucesso/erro agora têm variantes explícitas para tema escuro. A página foi revisada visualmente em `/contato` e recebeu teste de contrato dedicado.

A validação desta entrega alcançou **336 testes Vitest aprovados** e build de produção concluído com sucesso. A próxima tarefa da Fase 4 é auditar sistematicamente RBAC de cursos e turmas, retenção de 30 dias e operações da lixeira antes da homologação final.

### Conclusão da Fase 4 — Governança Integral, Regressão e Homologação

A Fase 4 foi integralmente concluída com a auditoria e consolidação das regras de governança para o ecossistema dos cinco tipos de curso:
1. **RBAC por Autoria**: Validado e aprimorado para cursos (`canManageCourse`), turmas externas (`canManageExternalClass`) e materiais (`canManageMaterial`), assegurando que professores gerenciem estritamente seus próprios registros, enquanto administradores e superadministradores possuem acesso global inegociável.
2. **Lixeira e Retenção de 30 Dias**: Mantida a política de exclusão lógica (*soft delete*), contadores reativos por escopo de usuário e exclusão permanente controlada com modais de segurança.
3. **Testes e Qualidade**: Suíte com **338 testes Vitest** aprovados com 100% de sucesso e build de produção validado.
