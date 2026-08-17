# Anderson Palafoz Platform - Master TODO (Next.js + Neon)

## Fase 1: Estrutura Base & Core Academic Framework ✅
- [x] Migrar para Next.js 15 (App Router) e Neon PostgreSQL com Drizzle ORM
- [x] Configurar autenticação NextAuth com Google OAuth, email/senha e permissões RBAC
- [x] Consolidar páginas públicas (Home, Sobre, Aulas, Materiais, Blog, Contato, FAQ, Privacidade)
- [x] Implementar CMS Global dinâmico e Seletor Visual de Logo (`BrandEditor`)

## Fase 2: Gamificação, IA e Ecossistema Acadêmico ✅
- [x] Sistema de XP, Ofensivas (Streaks UTC) e Loja com congelamento de ofensiva e cosméticos
- [x] Placar de líderes (Leaderboard) geral, por turma e para mini-jogos educacionais
- [x] Assistente de conversação por voz com IA e onda sonora interativa
- [x] Trilha de Aprendizagem Adaptativa com IA e feedback rápido

## Fase 3: Gestão Institucional e Projetos Externos (Megaworks, SIMAL, UFBA) ✅
- [x] Suporte a alunos e turmas de instituições parceiras externas
- [x] Painel de controle comparativo de desempenho e frequência entre instituições
- [x] Exportação de relatórios em PDF e CSV para chamada e progresso
- [x] Tags visuais institucionais e personalizáveis por professor

## Fase 4: Experiência Docente, Minha Área e Correção de Tarefas ✅
- [x] Centralização das áreas de Professor e Admin em "Minha Área" com menu lateral de acesso rápido
- [x] Cartões de resumo de tarefas pendentes na Minha Área do professor totalmente clicáveis para correção direta
- [x] Adicionar barra de pesquisa na "Minha Área" para professores filtrarem tarefas pendentes por nome do aluno ou disciplina

## Fase 5: Boletim PDF, Gráficos e Exportação Avançada ✅
- [x] Geração e download de boletins em PDF customizados com tag da instituição externa e cabeçalho do curso
- [x] Implementar animação de carregamento visualmente agradável enquanto o boletim PDF personalizado é gerado e baixado
- [x] Incluir gráfico de barras no boletim PDF exportado para ilustrar a evolução das notas do aluno ao longo do semestre

## Fase 6: Validação de Produção e Deploy ✅
- [x] Executar e aprovar 190 testes automatizados (Vitest) com 100% de sucesso
- [x] Validar build de produção do Next.js 15 sem erros
- [x] Testar persistência de sessão e robustez de fontes para deploy otimizado no Vercel

## Integrações Avançadas: Notificações Push, Google Calendar e Google Drive — 17/08/2026
- [x] Implementar notificações push em tempo real para alertar os professores sobre novas tarefas e notas enviadas
- [x] Adicionar integração com o Google Calendar para sincronizar automaticamente os prazos das turmas no calendário
- [x] Concluir integração operacional com o Google Drive para gerenciamento e visualização de documentos acadêmicos
- [x] Executar 190 testes automatizados com 100% de sucesso e validar build de produção do Next.js 15

## Ajustes Finais: Navegação Centralizada, Armazenamento Drive, Prazos por IA e Sincronização Manual — 17/08/2026
- [x] Garantir que os links de Professor e Administrador apareçam exclusivamente dentro do dashboard
- [x] Adicionar painel visual de uso de armazenamento do Google Drive na área administrativa
- [x] Implementar assistente de IA para sugerir automaticamente prazos no calendário com base no conteúdo de cada módulo
- [x] Criar botão de "Sincronizar Agora" na interface do calendário com feedback visual e tratamento de erros
- [x] Executar testes automatizados (190 testes) e validar build de produção do Next.js 15

## Conclusão de Ajustes Finais (Dashboard Centralizado, Google Drive, Prazos por IA e Sincronização) — 17/08/2026
- [x] Consolidar acessos de Professor e Administrador estritamente no Dashboard
- [x] Implementar painel visual de armazenamento do Google Drive na área de admin
- [x] Adicionar assistente de IA para sugestão automática de prazos por módulo
- [x] Implementar botão "Sincronizar Agora" na interface do calendário com feedback em tempo real
- [x] Validar 190 testes automatizados (100% de aprovação) e build de produção Next.js 15

## Ajustes de Navegação e Ferramentas Avançadas — 17/08/2026
- [x] Remover links de Admin e Professor do menu superior (header) e centralizá-los exclusivamente no Dashboard com base no papel do usuário
- [x] Adicionar opção de revisão e edição prévia para as sugestões de prazos geradas pela IA antes da aplicação ao calendário
- [x] Incluir gráfico de pizza no painel de armazenamento do Google Drive detalhando a distribuição por tipo de arquivo
- [x] Adicionar histórico de sincronização abaixo do botão "Sincronizar Agora" no calendário com data, hora e status

## Ajustes Finais de Navegação e Ferramentas — 17/08/2026
- [x] Remover links de Admin e Professor do menu superior (header) e centralizá-los exclusivamente no Dashboard
- [x] Implementar modal de revisão e edição das sugestões de prazos da IA antes da aplicação ao calendário
- [x] Adicionar gráfico de pizza no painel do Google Drive para distribuição de armazenamento por tipo de arquivo
- [x] Incluir histórico de sincronização detalhado abaixo do botão "Sincronizar Agora" no calendário
- [x] Validação completa com 190 testes automatizados (Vitest) e build de produção Next.js 15

## Refinamento de IA, Gráficos e Histórico — 17/08/2026
- [x] Adicionar botão "Aceitar Todas" no modal de sugestões de prazos da IA para aprovação em massa
- [x] Incluir tooltips interativos no gráfico de pizza do Google Drive exibindo o tamanho exato de cada tipo de arquivo
- [x] Adicionar paginação e limite de exibição no histórico de sincronização do calendário
- [x] Validar 190 testes automatizados e build de produção do Next.js 15

## Aprimoramentos Finais de IA, Google Drive e Sincronização — 17/08/2026
- [x] Adicionar botão "Aceitar Todas" no modal de sugestões da IA para aprovação em massa com feedback visual
- [x] Incluir tooltips interativos no gráfico de pizza do Google Drive para exibir o tamanho exato de cada tipo de arquivo
- [x] Adicionar paginação e limite ajustável no histórico de sincronização do calendário
- [x] Validação completa com 190 testes automatizados e build de produção Next.js 15

## Correção Definitiva de Navegação e Fontes — 17/08/2026
- [x] Remover links de Professor e Administrador do menu superior (header) e centralizá-los exclusivamente no sidebar da "Minha Área" (/dashboard) protegidos por nível de acesso
- [x] Preservar tipografia profissional (Inter e Poppins) via Google Fonts e globals.css com estabilidade garantida para o Vercel
- [x] Validação com 190 testes automatizados (Vitest) e build de produção Next.js 15 aprovados

## Restauração de Poppins, Indicadores de Cargo e Tour Guiado — 17/08/2026
- [x] Restaurar Poppins como fonte principal em todo o site com fallback para Inter
- [x] Adicionar indicador visual dinâmico de cargo (Administrador, Professor ou Aluno) no topo do menu lateral do dashboard
- [x] Criar atalhos rápidos no dashboard para alternância ágil entre os painéis de professor e administrador
- [x] Implementar tour guiado interativo no primeiro acesso para orientar sobre a nova localização dos painéis docentes
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15

## Conclusão da Restauração de Poppins e Aprimoramentos de Sidebar — 17/08/2026
- [x] Fonte Poppins restaurada como primária em todo o site
- [x] Indicador visual de cargo dinâmico (Administrador, Professor, Estudante) no topo do menu lateral
- [x] Atalhos rápidos de alternância entre os painéis de Professor e Administrador no dashboard
- [x] Tour guiado interativo de primeiro acesso explicando a nova localização dos painéis docentes
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15

## Novas Solicitações do Usuário — 17/08/2026
- [x] Permitir que o administrador personalize as cores dos indicadores de cargo no painel de configurações do sistema
- [x] Desenvolver e aprimorar o CMS administrativo em `/admin/cms` (edição visual, histórico, pré-visualização e mídias)
- [x] Adicionar badge com contagem de tarefas pendentes de correção diretamente nos atalhos do painel do professor
- [x] Incluir opção no menu de perfil do usuário para reiniciar o tour guiado a qualquer momento
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15

## Conclusão de Personalização, CMS, Badges e Tour — 17/08/2026
- [x] Implementada personalização administrativa das cores dos cargos no sistema com persistência
- [x] Desenvolvido e aprimorado o CMS em `/admin/cms` com recursos visuais avançados
- [x] Adicionado badge com contagem de tarefas pendentes de correção nos atalhos do painel do professor
- [x] Incluída opção no menu de perfil do usuário para reiniciar o tour guiado a qualquer momento
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Refinamentos Finais de CMS, Badge Clicável e Cores — 17/08/2026
- [x] Adicionar barra de pesquisa e filtros por categoria no gerenciador de mídias do CMS
- [x] Tornar o badge de tarefas pendentes clicável com redirecionamento direto para correção de atividades
- [x] Incluir botão "Restaurar Padrões" nas configurações de cores dos cargos no painel de admin
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Conclusão de Busca em Mídias, Badge Clicável e Restaurar Padrões — 17/08/2026
- [x] Adicionada barra de pesquisa e filtros por categoria no gerenciador de mídias do CMS
- [x] Tornado o badge de tarefas pendentes interativo e clicável, direcionando direto para a correção
- [x] Incluído botão "Restaurar Padrões" nas configurações de cores de cargos do painel de admin
- [x] Validação completa com 190 testes automatizados Vitest e build de produção Next.js 15

## Ajustes Finais de Tipografia e CMS — 17/08/2026
- [x] Restaurar a escala tipográfica exata da fonte Poppins sem alterações visuais excessivas
- [x] Adicionar atalho de teclado "/" para focar rapidamente na barra de pesquisa do gerenciador de mídias do CMS
- [x] Incluir resumo visual do uso de armazenamento no topo da biblioteca de mídias do CMS
- [x] Implementar seleção múltipla de arquivos no gerenciador de mídias com opção de exclusão em massa
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Conclusão de Tipografia Poppins e Atalhos do CMS — 17/08/2026
- [x] Restaurada a Poppins no tamanho tipográfico original sem distorções visuais
- [x] Adicionado atalho de teclado "/" para focar instantaneamente na pesquisa de mídias do CMS
- [x] Incluído resumo visual de armazenamento no topo da biblioteca de mídias do CMS
- [x] Implementada seleção múltipla e exclusão em massa de arquivos com confirmação
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados
