# Especificação Técnica: Módulos de Relatórios e Auditoria Administrativa

Este documento detalha os requisitos funcionais, o modelo de persistência de dados, a segurança baseada em papéis (RBAC) e os componentes de interface para as rotas **`/admin/relatorios`** (Relatórios Administrativos Gerais) e **`/admin/auditoria`** (Auditoria de Acessos e Atividades) na plataforma Anderson Palafoz.

---

## 1. Módulo de Relatórios Administrativos (`/admin/relatorios`)

### 1.1. Objetivo e Escopo
O painel de relatórios consolida métricas de engajamento, desempenho acadêmico, status de matrículas e volumetria de armazenamento diretamente das tabelas do Neon PostgreSQL e das integrações autorizadas do Google Classroom, sem recorrer a dados simulados ou valores estáticos [1] [2].

### 1.2. Requisitos Funcionais e Consultas
- **Filtros Temporais e por Turma:** Seleção de intervalo de datas (`from`, `to`) e filtragem opcional por turma importada do Google Classroom.
- **Gráficos Dinâmicos:** Exibição de distribuição de notas, taxa de frequência e evolução de matrículas utilizando SVG otimizado e paleta alinhada ao Design System.
- **Exportação Dual (PDF e Excel/CSV):** Geração de relatórios formatados para impressão direta em PDF (otimizados com contraste adequado e cabeçalho institucional) e exportação estruturada em CSV.
- **Modais de Detalhes Individuais:** Ao clicar em um aluno nas tabelas de resumo, abre-se um modal detalhado com histórico de notas, entregas e status de presença.

---

## 2. Módulo de Auditoria de Acessos (`/admin/auditoria`)

### 2.1. Objetivo e Escopo
O painel de auditoria rastreia e exibe eventos sensíveis de segurança e governança persistidos na tabela relacional `event_logs` [3].

### 2.2. Requisitos Funcionais e Segurança
- **Guards Estritos de Super Admin:** Acesso restrito exclusivamente ao superadmin (`palafozanderson@gmail.com`) ou administradores com privilégio validado por `requireAdmin`.
- **Filtros Avançados de Eventos:** Filtragem por tipo de evento (`login`, `material_submission`, `activity_complete`, `course_enroll`, `role_change`), endereço de e-mail e período [4].
- **Paginação Defensiva por Cursor/Offset:** Limitação estrita de 50 registros por página para proteger o banco de dados contra consultas pesadas.
- **Tratamento Honesto de Estados Vazios:** Ausência de eventos exibe mensagem clara sem inventar simulações ou registros fictícios.

---

## 3. Componentes UI e Acessibilidade (WCAG AAA)

- **Cartões de Indicadores (`SurfaceCard`):** Exibição de totais consolidados com ícones Lucide e microanimações [2].
- **Tabelas Responsivas com Paginação:** Navegação clara entre páginas de auditoria com estados de carregamento via `Loader2`.
- **Contraste e Suporte a Temas:** Cores validadas para garantir legibilidade perfeita nos modos Claro, Escuro e Alto Contraste.

---

## 4. Referências

[1] Relatórios Acadêmicos e Governança de Dados no Neon PostgreSQL. *Anderson Palafoz Platform Architecture*, 2026.  
[2] Web Content Accessibility Guidelines (WCAG) 2.1 — Level AAA. *World Wide Web Consortium (W3C)*, 2023.  
[3] Especificação de Trilha de Auditoria e Segurança de Sessões. *Security Standards*, 2025.  
[4] RBAC e Isolamento por Recurso em APIs Administrativas. *Backend Reference*, 2026.
