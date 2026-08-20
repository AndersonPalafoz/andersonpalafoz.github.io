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
