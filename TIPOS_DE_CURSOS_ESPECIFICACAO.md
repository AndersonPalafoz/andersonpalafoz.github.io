# Especificação Oficial: Taxonomia e Governança dos Cinco Tipos de Cursos

**Autor:** Anderson Palafoz  
**Plataforma:** Anderson Palafoz Platform  
**Data de Publicação:** Agosto de 2026  
**Status:** Documento Oficial de Arquitetura Pedagógica e Comercial  

---

## 1. Introdução e Contexto Operacional

A **Plataforma Anderson Palafoz** foi concebida como um ecossistema educacional de alta governança, voltado ao ensino de inglês e estudos acadêmicos. Atualmente, a operação é conduzida exclusivamente pelo professor **Anderson Palafoz**, com suporte a automações, IA e integrações seguras. No entanto, a arquitetura está preparada para expansão futura para múltiplos docentes, caso necessário.

Para organizar a oferta acadêmica sem gerar sobrecarga operacional ou confusão para os alunos, toda a oferta educacional da plataforma é classificada em exatamente **cinco tipos de cursos**. Cada tipo possui regras rígidas de acesso, modelos de entrega pedagógica, sinalização visual por cores e tags, e fluxos de atendimento específicos.

---

## 2. Taxonomia Visual e Resumo Comparativo

Para garantir consistência visual em todas as listagens (painel público, aluno, professor e admin), cada tipo de curso possui uma identidade de cor, tag e regra de interação distinta:

| Tipo de Curso | Denominação Comercial | Cor Oficial (Tag) | Tag de Exibição | Interação com o Professor | Plataforma de Hospedagem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tipo 1** | Cursos Fechados EAD (Gravados) | Azul Sólido (`bg-blue-100 text-blue-700`) | `[EAD Fechado]` | Sem acesso direto (Assíncrono total) | Nativa, Hotmart ou Google Classroom |
| **Tipo 2** | Cursos Híbridos com Encontros | Verde Esmeralda (`bg-emerald-100 text-emerald-700`) | `[Híbrido / Encontros]` | Encontros individuais ou em grupo via vídeo | Nativa + Vídeo Chamada |
| **Tipo 3** | Cursos Particulares Personalizados | Roxo Escuro (`bg-purple-100 text-purple-700`) | `[Particular Customizado]` | Acompanhamento direto e sob medida | Plataforma e Sessões Particulares |
| **Tipo 4** | Cursos Externos / Corporativos | Âmbar / Laranja (`bg-amber-100 text-amber-700`) | `[Externo / Corporativo]` | Gestão acadêmica e de turmas parceiras | Sistemas de Organizações Terceiras |
| **Tipo 5** | Aulas Presenciais e Agendamento | Vermelho Institucional (`bg-red-100 text-red-700`) | `[Presencial & Agendamento]` | Contato direto e encontros presenciais | Divulgação Pessoal & Agenda |

---

## 3. Especificação Detalhada dos Cinco Tipos de Curso

### 3.1. Tipo 1: Cursos Fechados (EAD Total / Gravados)
* **Conceito Pedagógico e Comercial:** São cursos que "já nascem prontos". O conteúdo é composto por aulas gravadas e materiais didáticos integralmente estruturados e disponíveis para consumo imediato.
* **Modelo de Acesso:** 
  * Se gratuito: O aluno realiza a matrícula instantaneamente com um clique e obtém acesso integral.
  * Se pago: O acesso é liberado automaticamente após a confirmação do pagamento (via integração Stripe ou liberação manual pelo administrador).
* **Interação com o Professor:** **Inexistente.** Esta modalidade é 100% EAD assíncrona. O aluno consome o conteúdo de forma autônoma e sequencial, sem direito a tira-dúvidas síncronas ou acompanhamento individualizado com o professor. Esta diretriz é explicitamente declarada na página de detalhes do curso.
* **Integração com Terceiros:** Ao adquirir ou se matricular, o aluno pode ser direcionado para ambientes e links externos onde o conteúdo está hospedado (como plataformas parceiras, Hotmart, Google Classroom ou repositórios seguros), funcionando como um hub ou ponte de redirecionamento transparente.

### 3.2. Tipo 2: Cursos Híbridos com Encontros (Gravados + Síncronos)
* **Conceito Pedagógico e Comercial:** Compartilha a estrutura base do Tipo 1 (aulas gravadas e materiais prontos), porém adiciona um componente síncrono de alto valor agregado: encontros periódicos agendados com o professor para resolução de dúvidas, prática oral e orientação pedagógica.
* **Modalidade dos Encontros:** Podem ocorrer em formato **individual** ou em **grupo**, realizados através de ferramentas integradas de videochamada (Google Meet ou similar).
* **Governança:** O aluno consome os módulos gravados no ritmo próprio e agenda os encontros síncronos conforme a disponibilidade da agenda do professor e as regras da turma.

### 3.3. Tipo 3: Cursos Particulares Personalizados (Sob Medida)
* **Conceito Pedagógico e Comercial:** Cursos desenhados especificamente para atender a necessidades urgentes ou metas particulares de um aluno ou pequeno grupo fechado (ex: preparação expressa para proficiência, viagem internacional iminente, entrevistas de emprego corporativas ou nivelamento sintático intensivo).
* **Flexibilidade Operacional:** Podem ser ministrados utilizando a infraestrutura da plataforma (como repositório de atividades e materiais exclusivos) ou integralmente fora dela, com cronogramas e conteúdos montados sob medida pelo professor Anderson Palafoz.

### 3.4. Tipo 4: Cursos Externos / Organizacionais (Gestão de Turmas Terceiras)
* **Conceito Pedagógico e Comercial:** Modalidade destinada à gestão de turmas e alunos vinculados a organizações, universidades ou projetos externos (como UFBA, Projeto SIMAL e parcerias corporativas).
* **Papel da Plataforma:** O site atua como um sistema de governança acadêmica centralizada para o professor, permitindo o lançamento de notas, controle de frequência, emissão de boletins em lote e relatórios em PDF, sem necessariamente hospedar todo o conteúdo curricular da instituição parceira.

### 3.5. Tipo 5: Aulas Presenciais e Plataforma de Agendamento (Divulgação Pessoal)
* **Conceito Pedagógico e Comercial:** Funciona como uma vitrine profissional e ferramenta de agendamento para aulas presenciais em Salvador/BA.
* **Modelo de Interação:** O site enfatiza a proposta de valor do ensino presencial e disponibiliza canais diretos de contato (WhatsApp, e-mail e formulário oficial) para que o aluno interessado possa alinhar horários, locais e propostas pedagógicas diretamente com o professor.

---

## 4. Diretrizes de Governança Futura

* **Autoria Única Inicial:** Atualmente, todas as ações de criação, exclusão, lixeira e recuperação são executadas por **Anderson Palafoz** (Superadministrador e Professor Titular).
* **Expansão Docente:** A arquitetura de banco de dados e controle de acesso (RBAC) está preparada para que, em um horizonte futuro distante, outros professores sejam integrados à plataforma. Nesse cenário, cada docente manterá autonomia exclusiva sobre a gestão, lixeira e recuperação apenas dos cursos, turmas e materiais criados por si mesmo, preservando a soberania global do administrador.

---
*Documento oficial de arquitetura de cursos gerado para a Plataforma Anderson Palafoz.*
