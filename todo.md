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
