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
