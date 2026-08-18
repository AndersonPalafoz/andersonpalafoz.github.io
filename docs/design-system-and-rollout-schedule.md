# Relatório de Arquitetura Visual, Design System e Cronograma Modular de Entrega

Este documento estabelece o contrato visual, as diretrizes de acessibilidade e o cronograma de implantação modular para a plataforma **Anderson Palafoz**, abrangendo integralmente o Painel Administrativo, a Área Docente (Professor) e a Área do Aluno (Dashboard). O objetivo é assegurar consistência estética absoluta, conformidade com as diretrizes WCAG AAA e robustez operacional baseada em dados reais provenientes do banco PostgreSQL (Neon) e das integrações autorizadas do Google Workspace.

---

## 1. Diretrizes de Design System e Identidade Visual

A linguagem visual da plataforma orienta-se pelos princípios do minimalismo funcional e da precisão acadêmica, inspirando-se em ecossistemas de referência como Notion, Linear, Stripe Dashboard e Vercel [1] [2]. A tipografia padrão adotada em toda a interface é a **Poppins**, garantindo legibilidade superior em tamanhos variados e preservando a hierarquia tipográfica em computadores, tablets e smartphones.

A paleta oficial fundamenta-se no **Vermelho Institucional (`#D62828`)** como cor primária de destaque, complementada por tons neutros sofisticados e superfícies responsivas aos modos claro, escuro e de alto contraste. Todos os componentes interativos incorporam microinterações controladas, raios de borda padronizados (de 8px a 24px) e estados de foco visíveis para navegação por teclado [3].

| Camada Visual | Especificação Técnica | Aplicação Principal |
| :--- | :--- | :--- |
| **Cor Primária** | `#D62828` (Vermelho Institucional) | Botões de ação principal, selos ativos, indicadores e alertas importantes. |
| **Tipografia** | Poppins (Pesos: 400, 600, 700, 900) | Títulos, rótulos de navegação, textos corridos e métricas de painéis. |
| **Elevação e Sombras** | Sombra sutil de card (`0 4px 12px rgba(0,0,0,0.08)`) | Separação de conteúdos em cartões, modais e barras laterais flutuantes. |
| **Espaçamento Base** | Múltiplos de 8px (8, 16, 24, 32, 48, 64) | Alinhamento consistente em grids responsivos de 12 colunas (Desktop) e 4 colunas (Mobile). |

> "A consistência visual absoluta é o pilar que garante que o usuário perceba a plataforma como um produto único, integrado e altamente confiável, eliminando qualquer sensação de fragmentação durante a navegação entre as áreas públicas e restritas." — Diretrizes de Marca e UX [4].

---

## 2. Componentes UI Reutilizáveis e Transversais

Para evitar redundâncias e manter a manutenibilidade do código, todas as telas da plataforma consomem uma biblioteca unificada de componentes construídos sobre Tailwind CSS e shadcn/ui. Abaixo destacam-se os principais elementos estruturais:

- **Cartões de Resumo e Métricas (`SurfaceCard`):** Contêineres com bordas suaves, cantos arredondados em `rounded-3xl` e espaçamento interno proporcional, utilizados para exibir KPIs de engajamento, estatísticas de turmas e resumos individuais.
- **Tabelas de Dados Responsivas (`DataTable`):** Componentes tabulares com rolagem horizontal otimizada para dispositivos móveis, paginação integrada baseada em servidor, paginação por cursor/limite e linhas alternadas para leitura facilitada.
- **Modais e Diálogos de Confirmação (`ManusDialog`):** Superfícies flutuantes com foco preso (focus trap), fechamento por tecla Escape e botões de confirmação destacados para ações críticas, como exclusão de registros ou concessão de acessos.
- **Skeleton Loaders Transversais:** Substitutos visuais animados para carregamentos assíncronos, garantindo que o layout permaneça estável e prevenindo saltos visuais ou saltos de reflow durante a recuperação de dados do banco Neon [3].
- **Seletor de Temas e Acessibilidade:** Componente unificado na barra de navegação e na barra inferior mobile, permitindo alternar instantaneamente entre modo claro, escuro, sistema e alto contraste com atalhos de teclado dedicados.

---

## 3. Cronograma Modular de Entrega

O plano de aprimoramento e consolidação está estruturado em três frentes principais de trabalho, correspondentes aos módulos solicitados. Cada módulo passará por validação estrita de tipos TypeScript, testes automatizados Vitest e compilação de produção Next.js 15.

```
[Módulo Admin] ──> [Módulo Professor] ──> [Módulo Aluno] ──> [Validação & Checkpoint]
```

### Módulo 1: Painel Administrativo (`/admin/*`)
Foco na governança central, segurança superadmin e integridade de dados relacionais.

| Rota / Área | Aprimoramentos Planejados | Critério de Aceite |
| :--- | :--- | :--- |
| **`/admin`** | Refinamento do layout de KPIs e gráficos temporais de sessões. | Visualização em tempo real de estatísticas extraídas do Neon. |
| **`/admin/usuarios`** | Filtros avançados, busca por papel e moderação de status. | Listagem paginada com ações seguras de alteração de papéis. |
| **`/admin/cursos` & Módulos** | Construtor visual otimizado e ordenação persistida de aulas. | Gestão completa de cursos sem dependência de código. |
| **`/admin/materiais` & Aulas** | Upload restrito, tags e isolamento por propriedade. | Vínculo seguro de arquivos no Supabase Storage. |
| **`/admin/atividades` & Chamada** | Rubricas, controle de frequência e relatórios exportáveis. | Lançamento e consulta de presenças com dados reais. |
| **`/admin/medalhas` & Fórum** | Concessão manual e moderação de tópicos denunciados. | Registro persistido de medalhas e moderação de fórum. |
| **`/admin/reviews` & Avaliações** | Gestão de notas de cursos e respostas oficiais. | Feedback formativo visível nas listagens públicas e restritas. |
| **`/admin/matriculas` & Mensagens** | Controle de matrículas ativas e central de avisos. | Envio de mensagens internas com auditoria. |
| **`/admin/artigos` & Blog** | Editor rich text, slugs e metadados SEO. | Publicação de artigos otimizados para mecanismos de busca. |
| **`/admin/cms` & Relatórios** | Biblioteca de mídia paginada e relatórios em PDF/Excel. | Exportação limpa de dados sem sobrecarga no Neon. |
| **`/admin/auditoria` & Cupons** | Logs de eventos de login/sessão e gestão de descontos Stripe. | Auditoria de acessos sensíveis e validação de cupons. |
| **`/admin/liberacao-acesso`** | Interface de liberação e revogação manual de conteúdo pago. | Controle exclusivo do superadmin (`palafozanderson@gmail.com`). |

### Módulo 2: Painel do Professor (`/professor/*`)
Foco na autonomia docente, acompanhamento de turmas e suporte a instituições parceiras.

| Rota / Área | Aprimoramentos Planejados | Critério de Aceite |
| :--- | :--- | :--- |
| **`/professor`** | Resumo unificado com cartões clicáveis de tarefas pendentes. | Visão geral limpa com contadores de pendências e turmas. |
| **`/professor/alunos`** | Busca por nome/email e perfil consolidado. | Acesso rápido aos dados de estudantes sob tutela docente. |
| **`/professor/progresso`** | Indicadores de aproveitamento acadêmico. | Gráficos e tabelas comparativas de desempenho. |
| **`/professor/progresso-aulas`** | Avaliação de speaking e acompanhamento de conclusão. | Interface sem menções à IA, focada na avaliação humana. |
| **`/professor/tarefas`** | Correção de entregas, atribuição de notas e rubricas. | Feedback formativo persistido e notificado ao aluno. |
| **`/professor/turmas-externas`** | Gestão de turmas de projetos parceiros (SIMAL, Megaworks, UFBA, IsF, PROFICI). | Cadastro e chamada manual para turmas externas. |
| **`/professor/boletim/[studentId]`** | Boletim individual consolidado com notas e frequências. | Exportação em PDF otimizada para impressão direta. |

### Módulo 3: Área do Aluno (`/dashboard/*`)
Foco na experiência de aprendizagem imersiva, gamificação opcional e transparência acadêmica.

| Rota / Área | Aprimoramentos Planejados | Critério de Aceite |
| :--- | :--- | :--- |
| **`/dashboard`** | Onboarding interativo, metas semanais e progresso em tempo real. | Visão inicial limpa para novos usuários sem progresso prévio. |
| **`/dashboard/perfil` & Cursos** | Galeria de medalhas, upload de avatar e catálogo de cursos. | Personalização de perfil e acesso aos cursos liberados. |
| **`/dashboard/atividades` & Biblioteca** | Entrega de tarefas e acesso a guias de gramática em PDF. | Visualização de materiais autorizados e envio de respostas. |
| **`/dashboard/calendario` & Histórico** | Sincronização com Google Calendar e histórico de notas. | Prazos reais sincronizados e boletim acadêmico detalhado. |
| **`/dashboard/certificados` & Compras** | Emissão de certificados e histórico financeiro/compras. | Validação pública de certificados e recibos de pagamento. |
| **`/dashboard/desejos` & Anotações** | Lista de desejos de cursos e notas pessoais marcadas. | Interação fluida com persistência em banco relacional. |
| **`/dashboard/notificacoes` & Trilha** | Central de alertas e trilha adaptativa baseada em erros. | Notificações em tempo real e recomendações de estudo. |

---

## 4. Referências

[1] Notion Product Philosophy and Modular Layouts. *Notion Design Engineering Guidelines*, 2025.  
[2] Linear Design System: Speed, Precision, and Dark Mode Craftsmanship. *Linear UI Standard*, 2024.  
[3] Web Content Accessibility Guidelines (WCAG) 2.1 — Level AAA. *World Wide Web Consortium (W3C)*, 2023.  
[4] Palafoz, Anderson. *Diretrizes Pedagógicas e Identidade Visual Institucional*, 2026.
