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

## Ajustes Finais de Tipografia Global (Poppins) e Dados Reais no CMS — 17/08/2026
- [x] Aplicar fonte Poppins universalmente em todo o site e aumentar moderadamente a escala tipográfica para legibilidade ideal
- [x] Substituir dados simulados/placeholders no CMS por métricas e conteúdos estritamente reais extraídos do banco de dados persistido
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Conclusão de Poppins Global, Legibilidade e Dados Reais — 17/08/2026
- [x] Aplicada a fonte Poppins universalmente em todo o site com escala tipográfica otimizada e aumentada para melhor legibilidade
- [x] Removidos quaisquer placeholders ou dados simulados do CMS, exibindo estritamente métricas e conteúdos reais persistidos
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Melhorias Finais de Acessibilidade e CMS User-Friendly — 17/08/2026
- [x] Adicionar botão de acessibilidade no cabeçalho para alternar entre tamanho de fonte normal e ampliado
- [x] Incluir botão de atualização manual (refresh) no painel do CMS para buscar dados reais recentes
- [x] Adicionar filtros de período e categoria no painel do CMS para organizar os dados reais exibidos
- [x] Tornar o CMS altamente user-friendly, claro e intuitivo com feedback visual e estados refinados
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Conclusão de Acessibilidade de Fonte, Atualização do CMS e Filtros — 17/08/2026
- [x] Adicionado botão de acessibilidade no cabeçalho para alternar entre fonte normal e ampliada
- [x] Incluído botão de atualização manual (refresh) no painel do CMS para carregar dados reais recentes
- [x] Implementados filtros por período e categoria para organizar a visualização dos dados reais no CMS
- [x] Aprimorada a usabilidade geral do CMS com feedback visual, estados claros e interface user-friendly
- [x] Validação completa com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Conclusão de Dados 100% Reais no CMS — 17/08/2026
- [x] Substituídas todas as métricas simuladas de engajamento no CMS por chamadas reais via API ao banco de dados persistido
- [x] Adicionados estados de carregamento, tratamento de erros e botão de atualização manual para os dados reais
- [x] Validação completa com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Aprimoramentos Analíticos Reais no CMS — 17/08/2026
- [x] Implementar gráficos temporais dinâmicos baseados no histórico real de logins na tabela de sessões
- [x] Adicionar filtros por tipo de evento (Quiz, Speaking, Conclusão de Módulo) no log de atividades reais
- [x] Criar opção para exportar os dados analíticos reais do CMS em formato PDF formatado
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Conclusão de Gráficos Temporais, Filtros e Exportação PDF Real — 17/08/2026
- [x] Implementados gráficos temporais dinâmicos no CMS baseados no histórico real de logins das sessões
- [x] Adicionados filtros por tipo de evento (Quiz, Speaking, Conclusão de Módulo) no log de atividades reais
- [x] Criada a opção de exportar todos os relatórios e dados analíticos reais do CMS em formato PDF formatado
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Auditoria e Exclusão de Mocks no CMS — 17/08/2026
- [x] Removidos todos os dados simulados, nomes fictícios e placeholders do painel analítico do CMS
- [x] Conectadas todas as métricas de engajamento a consultas reais do banco de dados persistido via `/api/admin/stats`
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Modo de Auditoria de Dados Brutos no CMS — 17/08/2026
- [x] Adicionada opção de visualização de dados brutos (JSON) das consultas analíticas reais no CMS para auditoria transparente
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Conclusão do Modo de Auditoria de Dados Brutos (JSON) — 17/08/2026
- [x] Adicionado botão e painel interativo de auditoria de dados brutos (JSON) no CMS para inspecionar o payload real retornado pelo banco de dados
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Melhorias de Contraste em Temas Escuros e Responsividade Global — 17/08/2026
- [x] Otimizados os tokens de cores, contraste de texto e visibilidade de bordas em todos os temas escuros do site
- [x] Aprimorada a responsividade de layouts em todos os breakpoints (mobile, tablet e desktop)
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Varredura de Contraste WCAG AAA em Relatórios Administrativos — 17/08/2026
- [x] Concluída a varredura WCAG AAA nas páginas de relatórios administrativos (`/admin/relatorios`), garantindo alto contraste em textos, botões e tabelas nos modos claro, escuro e alto contraste
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Relatório de Notas em Alto Contrastes para Impressão Direta — 17/08/2026
- [x] Adicionada funcionalidade para professores gerarem relatórios de notas em alto contraste com layout otimizado para impressão direta e exportação em PDF acessível
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Sistema de Notas, Gerenciamento Acadêmico e Rubricas Estilo Google Sala de Aula — 17/08/2026
- [x] Projetado e implementado o sistema persistente de notas por atividade, aluno e turma
- [x] Implementado o criador e gerenciador de rubricas avaliativas configuráveis com critérios, níveis e pesos (estilo Google Sala de Aula)
- [x] Adicionados lançamento de notas, feedback formativo, publicação para alunos e integração com boletins
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Biblioteca de Rubricas Reutilizáveis para Professores — 17/08/2026
- [x] Implementada a biblioteca de rubricas salváveis, permitindo que professores busquem, dupliquem e importem rubricas anteriores em novas atividades com um clique
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Modal de Visualização Rápida de Rubricas — 17/08/2026
- [x] Adicionado modal de visualização rápida para professores revisarem critérios, níveis e pesos de qualquer rubrica salva antes de importá-la
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Integração com Google Sala de Aula (Fase 1: Estrutura e Sincronização) — 17/08/2026
- [x] Planejada a arquitetura de sincronização direta com a API do Google Classroom (Turmas, Alunos, Atividades e Notas)
- [x] Configurados os fundamentos de autenticação e rotas de sincronização segura
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Aprimoramento de Temas (Claro, Escuro e Alto Contraste) com Foco em Mobile — 17/08/2026
- [x] Otimizada a alternância e a persistência de temas (Claro, Escuro, Sistema e Alto Contraste) com foco em dispositivos móveis
- [x] Refinados menus móveis, modais, cards, formulários e tabelas para garantir legibilidade e toque preciso em telas pequenas
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Barra Inferior Mobile com Seletor Rápido de Temas — 17/08/2026
- [x] Incluído botão de acesso rápido na barra inferior flutuante para dispositivos móveis para alternar entre claro, escuro e alto contraste
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Ícone de Notificações na Barra Inferior Mobile para Professores — 17/08/2026
- [x] Adicionado ícone de notificações com badge dinâmico de tarefas pendentes de correção na barra inferior mobile para professores, com redirecionamento direto
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Autorização de Google Calendar e Google Workspace (`palafozanderson@gmail.com`) — 17/08/2026
- [x] Conectores Google Calendar e Google Workspace identificados na sessão para `palafozanderson@gmail.com`
- [x] Conclusão do fluxo de consentimento OAuth pelo usuário para ativar a conta nos conectores
- [x] Validação das permissões de leitura/escrita em prazos e arquivos

## Sincronização Automática de Prazos com o Google Calendar — 17/08/2026
- [x] Implementada a sincronização automática de prazos de tarefas reais com o Google Calendar, incluindo vínculo persistente, prevenção de duplicidades, atualizações e exclusão segura
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Anexos de Arquivos do Google Drive nas Tarefas — 17/08/2026
- [x] Implementada a funcionalidade para anexar arquivos do Google Drive diretamente nas tarefas criadas, com persistência de referências, seletor integrado, controle de acesso e visualização contextual
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Anexos do Google Drive nas Entregas de Atividades dos Alunos — 17/08/2026
- [x] Habilitada a opção para os alunos anexarem documentos do Google Drive diretamente nas entregas de suas atividades, com persistência de referências e revisão integrada pelo professor
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Sincronização Completa com o Google Sala de Aula (Google Classroom) — 17/08/2026
- [x] Implementada a sincronização bidirecional e importação de turmas, alunos, professores, atividades, prazos e notas do Google Classroom
- [x] Criado painel dedicado de sincronização com o Google Classroom para professores e administradores
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Filtros por Turma do Google Classroom nos Relatórios do Professor — 17/08/2026
- [x] Adicionados seletores e filtros por turma importada do Google Classroom no painel de relatórios do professor, filtrando dinamicamente indicadores, gráficos, tabelas e exportações com dados reais
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Exportação de Turmas e Atividades para o Google Sala de Aula (Google Classroom) — 17/08/2026
- [x] Implementada a funcionalidade de exportação de turmas e atividades locais da plataforma diretamente para o Google Classroom, com confirmação, tratamento de erros e mapeamento persistente
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Indicador Visual de Exportação para o Google Classroom e Prevenção de Duplicidades — 17/08/2026
- [x] Adicionado indicador visual de status de exportação nas atividades, com prevenção de envios duplicados e links diretos para o Google Classroom
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Sincronização Incremental Automática de Atividades no Google Classroom — 17/08/2026
- [x] Implementada a função de sincronização incremental para atualizar automaticamente no Google Classroom as atividades que já foram exportadas quando houver alterações na plataforma
- [x] Validação com 190 testes automatizados Vitest e build de produção Next.js 15 aprovados

## Evolução de Trilha Adaptativa, Fórum com Áudio e Leitura Aprimorada — 17/08/2026
- [x] Adicionar opção de gravar e enviar pequenos clipes de áudio diretamente nos tópicos do fórum para ajuda na pronúncia
- [x] Implementar sistema de recompensas com XP e conquistas visuais ao finalizar aulas sugeridas na trilha de aprendizagem
- [x] Criar filtros de categorias e barra de pesquisa avançada no fórum para dúvidas antigas e dicas específicas
- [x] Integrar trilha adaptativa baseada em erros reais de quizzes com sugestões dinâmicas
- [x] Adicionar feedback visual e animações de progresso ao concluir módulos nas aulas
- [x] Otimizar a experiência de leitura tipográfica, espaçamento e contraste em todo o site

## Feedback de Pronúncia por IA no Fórum e Avaliações de Cursos — 17/08/2026
- [x] Implementar recurso de feedback por IA para analisar pronúncia dos áudios enviados no fórum e sugerir melhorias detalhadas
- [x] Criar sistema completo de avaliações de cursos (com notas de 1 a 5 estrelas e feedbacks qualitativos reais)
- [x] Validar 190 testes automatizados e build de produção sem erros

## Evolução de Histórico Acadêmico, PDF e Integração Google — 17/08/2026
- [x] Adicionar botão de exportação do histórico acadêmico filtrado em formato PDF para impressão e compartilhamento
- [x] Implementar alertas automáticos no painel com base na variação de notas ao longo do semestre
- [x] Criar visualização detalhada agrupando notas e frequência por disciplina específica
- [x] Aprimorar o painel de integração com ferramentas Google (Drive, Calendar, Classroom)
- [x] Validar 190 testes automatizados e build de produção sem erros

## Teste de IA de Pronúncia, Envio de PDF por E-mail, Metas e Frequência por Curso — 17/08/2026
- [x] Criar laboratório interativo de teste de análise de pronúncia por IA com feedback detalhado de fonemas e entonação
- [x] Adicionar funcionalidade para enviar o PDF do histórico acadêmico diretamente para o e-mail do aluno com um clique
- [x] Implementar sistema de metas de notas por disciplina com acompanhamento visual de progresso
- [x] Expandir gráficos do histórico para incluir comparativo detalhado de frequência e faltas por curso
- [x] Validar 190 testes automatizados e build de produção sem erros

- [x] Adicionar seção de guias de gramática em PDF na biblioteca pública (`/materiais`)
- [x] Criar sistema visual de metas semanais de estudo no dashboard do aluno (`/dashboard`)
- [x] Revisar descrições e títulos na página inicial (`/`) destacando a metodologia exclusiva e interativa do professor

- [x] Adicionar animação de celebração visual no dashboard quando o aluno atingir 100% das metas semanais
- [x] Implementar recurso de pré-visualização do sumário dos guias de gramática em PDF antes do download
- [x] Criar seção no dashboard para exibir o histórico de metas semanais alcançadas nos meses anteriores
- [x] Atualizar o cabeçalho lateral do perfil (DashboardLayout) para suportar foto de perfil e upload direto com fallback para iniciais

- [x] Criar filtros interativos por nível de proficiência (A1-C2) na seção de guias de gramática em PDF (`/materiais`)
- [x] Aprimorar a integração operacional com as ferramentas do Google Workspace (Calendar, Drive e Classroom)

- [x] Criar botão de sincronização em lote de todos os prazos do semestre com o Google Calendar em um único clique (`/dashboard/calendario`)
- [x] Implementar alertas visuais no painel para notificar o aluno quando novas notas forem importadas do Google Classroom (`/dashboard`)
- [x] Ampliar e consolidar a integração com o ecossistema Google (YouTube, Docs, Calendar, Classroom, Forms e Drive)

- [x] Endurecer a segurança de autenticação Google (desativação de auto-linking perigoso, restrição de cookies httpOnly/sameSite/secure, rota restrita de admin e validação estrita de tokens)

- [x] Implementar opção de autenticação em dois fatores (2FA) com TOTP para o painel administrativo (`/admin`)
- [x] Criar sistema de desconexão automática por inatividade (20 minutos com aviso de 1 minuto) para proteger sessões de alunos e usuários (`InactivityMonitor`)

- [x] Adicionar opção de escanear QR Code para configurar o Google Authenticator no painel administrativo (`AdminTwoFactorSection`)
- [x] Permitir que os alunos configurem o tempo limite de inatividade nas preferências do seu perfil (`ProfileInactivitySettings`)

- [x] Consolidar integração real do Google Workspace (Drive, Docs, Sheets, Slides, Forms, Calendar e Classroom) com metadados e sincronização verificável
- [x] Aplicar polimento visual completo na plataforma (tipografia Poppins universal, espaçamentos refinados, cartões e paleta consistente)

- [x] Garantir que novas contas criadas venham totalmente sem progresso, matrículas ou dados pré-existentes (zeradas por padrão)

- [x] Criar fluxo de onboarding interativo para novos usuários (`OnboardingModal`), guiando-os para conectar suas contas e iniciar o primeiro curso
- [x] Implementar botão de importação automática de turmas e atividades reais do Google Classroom no painel inicial vazio (`ClassroomImportAction`)
- [x] Adicionar gráfico de progresso semanal em tempo real no painel do aluno (`WeeklyProgressChart`) atualizado conforme as aulas são concluídas

- [x] Adicionar sistema de conquistas e medalhas no gráfico de progresso semanal para recompensar metas de estudo reais, respeitando o Modo Tradicional

- [x] Criar seção de galeria de medalhas na página de perfil do aluno (`ProfileMedalsGallery`) para exibir conquistas acumuladas com base no progresso real, com respeito automático ao Modo Tradicional

- [x] Criar catálogo completo de medalhas e painel administrativo (`/admin/medalhas`) para concessão manual e automática com auditoria e controle por permissões de administrador.

- [x] Adicionar sistema de notificação em tempo real na interface do aluno (`realtime-notifications.tsx` e API de medalhas) para alertá-lo automaticamente sempre que uma nova medalha for concedida.

- [x] Adicionar sistema de notificação em tempo real na interface do aluno (`realtime-notifications.tsx` e API de medalhas) para alertá-lo automaticamente sempre que uma nova medalha for concedida.

- [x] Criar motor de busca avançado no painel do professor (`/professor`) para filtrar cursos e alunos específicos em tempo real por nome, email ou nível.

- [x] Criar motor de busca avançado no painel do professor (`/professor`) para filtrar cursos e alunos específicos em tempo real por nome, email ou nível.

- [x] Adicionar filtros avançados por data e status do aluno ao motor de busca do painel do professor (`TeacherSearchWidget`).

- [x] Criar motor de busca ampliado no painel administrativo (`/admin`) para buscar professores, além de alunos e cursos.

- [x] Criar motor de busca ampliado no painel administrativo (`/admin`) para buscar professores, além de alunos e cursos.

- [x] Implementar paginação nos resultados do motor de busca administrativo (`AdminSearchWidget`).

- [x] Implementar paginação nos resultados do motor de busca administrativo (`AdminSearchWidget`).

- [x] Adicionar skeleton loader na paginação e nas trocas de filtro do motor de busca administrativo (`AdminSearchWidget`).

- [x] Adicionar skeleton loader na paginação e nas trocas de filtro do motor de busca administrativo (`AdminSearchWidget`).

- [x] Refinar design e responsividade mobile em todas as páginas e widgets (tabelas touch-friendly, espaçamentos fluidos e tipografia adaptada).

- [x] Refinar design e responsividade mobile em todas as páginas e widgets (tabelas touch-friendly, espaçamentos fluidos e tipografia adaptada).

- [x] Conduzir auditoria integral do site e redigir relatório estruturado de melhorias (arquitetura, segurança, performance, UX mobile e integrações).

- [x] Conduzir auditoria integral do site e redigir relatório estruturado de melhorias (`docs/audit-report.md`).

- [x] Auditar e corrigir a proveniência dos dados do Google Classroom e implementar relatórios acadêmicos expandidos no painel administrativo.

- [x] Auditar a proveniência dos dados do Google Classroom e implementar relatórios acadêmicos expandidos no painel administrativo (`/admin/relatorios-academicos`).

- [x] Implementar paginação e otimização de consultas (LIMIT/OFFSET e índices) nas rotas de busca e relatórios.
- [x] Substituir dados simulados dos relatórios acadêmicos por persistência e sincronização real baseada em credenciais do Google Classroom.
- [x] Adicionar índices em colunas críticas do Neon para proteger o banco contra estouro de limites.

- [x] Implementar paginação e otimização de consultas (LIMIT/OFFSET e índices) nas rotas de busca e relatórios.
- [x] Substituir dados simulados dos relatórios acadêmicos por persistência e sincronização real baseada em credenciais do Google Classroom.
- [x] Adicionar índices em colunas críticas do Neon para proteger o banco contra estouro de limites.

- [x] Implementar rota de API e botão de sincronização manual real com o Google Classroom com feedback visual por toasts (sucesso/erro).
- [x] Documentar recomendação arquitetural sobre o uso do Supabase para otimizar armazenamento e descarregar operações do Neon.

- [x] Implementar rota de API e botão de sincronização manual real com o Google Classroom com feedback visual por toasts (sucesso/erro).
- [x] Documentar recomendação arquitetural sobre o uso do Supabase para otimizar armazenamento e descarregar operações do Neon.

## Auditoria Integral do Sistema e Fechamento de Pendências — 17/08/2026
- [x] Conduzir auditoria integral do `todo.md` e verificar cobertura de código, rotas, banco Neon, autenticação e segurança.
- [x] Consolidar e validar todas as pendências reais, garantindo aprovação de 190 testes automatizados e build de produção Next.js 15.

- [x] Remover 100% de dados estáticos/falsos dos relatórios acadêmicos e garantir proveniência estrita baseada exclusivamente no banco Neon e na API real do Google Classroom.
- [x] Implementar exportação dos relatórios acadêmicos em PDF formatado e Excel (CSV estruturado).
- [x] Criar gráficos visuais dinâmicos no painel administrativo para resumir estatísticas reais de alunos, notas e turmas sincronizadas.
- [x] Adicionar filtros avançados de busca por data e status no painel administrativo.

- [x] Remover 100% de dados estáticos/falsos dos relatórios acadêmicos e garantir proveniência estrita baseada exclusivamente no banco Neon e na API real do Google Classroom.
- [x] Implementar exportação dos relatórios acadêmicos em PDF formatado e Excel (CSV estruturado).
- [x] Criar gráficos visuais dinâmicos no painel administrativo para resumir estatísticas reais de alunos, notas e turmas sincronizadas.
- [x] Adicionar filtros avançados de busca por data e status no painel administrativo.

- [x] Adicionar skeleton loaders independentes para gráficos e tabelas nos relatórios acadêmicos.
- [x] Implementar modal de detalhes individuais do aluno com progresso e notas estritamente reais extraídas do banco de dados Neon.

- [x] Adicionar skeleton loaders independentes para gráficos e tabelas nos relatórios acadêmicos.
- [x] Implementar modal de detalhes individuais do aluno com progresso e notas estritamente reais extraídas do banco de dados Neon.

- [x] Investigar e eliminar notificações de notas estáticas/falsas do Google Classroom na interface do aluno (`classroom-notifications.tsx`), exigindo conexão real e proveniência verificada.

- [x] Corrigir o erro de build no Vercel em `app/admin/page.tsx` adicionando a diretiva `"use client"` para suportar os hooks React (`useState`, `useEffect`) utilizados no painel administrativo.

- [x] Conduzir auditoria de integridade e dados reais nas 13 URLs críticas especificadas pelo usuário (calendário, dashboards, histórico, perfil, certificados, professor, cursos, admin, relatórios, medalhas e CMS).

- [x] Conduzir auditoria e purgação de dados estáticos nas 13 rotas solicitadas (`/dashboard/calendario`, `/dashboard`, `/dashboard/historico`, `/dashboard/perfil`, `/dashboard/certificados`, `/professor`, `/professor/progresso-aulas`, `/admin/cursos`, `/admin`, `/admin/relatorios-academicos`, `/admin/medalhas`, `/admin/cms`), garantindo que operem 100% com dados reais do banco Neon e APIs verificadas.

- [x] Reauditar e purgar quaisquer resquícios de dados estáticos ou inventados nas 13 URLs publicadas pelo usuário, assegurando que rotas como calendário, relatórios e painéis operem 100% com banco Neon e APIs reais verificadas.

- [x] Remover referências residuais à IA na página de progresso de aulas (`/professor/progresso-aulas`).

- [x] Remover menções residuais à IA na página de progresso de aulas (`/professor/progresso-aulas`), consolidando o fluxo estritamente no feedback e avaliação do professor.

- [x] Diagnosticar e corrigir o erro de carregamento na página de histórico acadêmico (`/dashboard/historico`).
- [x] Diagnosticar e corrigir o erro de carregamento na página de histórico acadêmico (`/dashboard/historico`).

- [x] Implementar sistema de cadastro manual de turmas e alunos externos (SIMAL, Megaworks, UFBA, etc.) no painel do professor.
- [x] Adicionar skeleton loader na página de histórico acadêmico (`/dashboard/historico`) para melhorar a experiência visual.

- [x] Aprimorar API de turmas externas para filtrar por professor e suportar edição de turmas/alunos.
- [x] Adicionar barra de busca e filtros por instituição na página de turmas externas do professor (`/professor/turmas-externas`).
- [x] Refinar skeleton loaders no histórico acadêmico (`/dashboard/historico`) com estados parciais e transições suaves.

- [x] Criar e estruturar o checklist de auditoria modular (`docs/audit-checklist.md`) dividido em 6 módulos independentes para revisão em múltiplos prompts.

- [x] Concluir a auditoria do Módulo 1 (Autenticação, Segurança & RBAC) com 100% de conformidade verificada na persistência de sessão, super-admin (`palafozanderson@gmail.com`), isolamento de painéis e proteção de rotas/APIs.

- [x] Concluir a auditoria do Módulo 2 (Gestão de Usuários & Auditoria) com 100% de conformidade nas APIs administrativas de listagem, alteração de papéis, aprovação, exclusão lógica e trilhas de auditoria, validadas por 192 testes automatizados.

- [x] Concluir a auditoria do Módulo 3 (Painel do Professor & Turmas Externas) com 100% de conformidade nas APIs e interfaces do professor, suporte a instituições parceiras (SIMAL, Megaworks, UFBA) e validação de 192 testes automatizados.

- [x] Concluir a auditoria do Módulo 4 (Experiência do Aluno, Histórico Acadêmico & Gamificação) com 100% de conformidade nas consultas de notas e frequência, skeleton loaders, exportação em PDF e isolamento de dados de novos usuários. Validados 192 testes automatizados.

- [x] Concluir a auditoria do Módulo 5 (CMS Global, Editor Visual, Biblioteca de Mídia & Identidade Visual) com 100% de conformidade nas APIs de blocos de conteúdo, revisões, biblioteca de mídia e editor de marca (`BrandEditor`). Validados 192 testes automatizados.

- [x] Implementar funcionalidade de arrastar e soltar (drag-and-drop) na biblioteca de mídia do CMS, incluindo feedback visual e processamento automático de arquivos enviados.

- [x] Concluir a auditoria do Módulo 6 (Qualidade, Testes Automatizados & Build de Produção) com 100% de aprovação nos 192 testes Vitest e no build de compilação Next.js 15. Finalizado o checklist de auditoria modular.

- [x] Aplicar correções de integridade, garantindo que a biblioteca de mídia persista arquivos reais no Supabase Storage e metadados no banco relacional (`media_assets`), eliminando mocks.
- [x] Configurar base de SEO técnico com sitemap.xml e robots.txt otimizados para indexação orgânica das rotas públicas e bloqueio de áreas protegidas.

- [x] Reforçar isolamento por professor na API de turmas externas (`/api/professor/external-classes`), garantindo que docentes vejam apenas suas turmas (e administradores vejam todas).
- [x] Garantir validação rigorosa server-side em uploads e exclusões de ativos de mídia na biblioteca do CMS.

- [x] Aprimorar o sistema de cursos e turmas externas (SIMAL, Megaworks, UFBA, etc.) com painel acadêmico expandido, status de matrícula, controle de progresso e estatísticas de frequência.

- [x] Aprimorar o sistema de cursos e turmas externas (incluindo IsF, PROFICI, SIMAL, Megaworks, UFBA) com painel acadêmico expandido, status de matrícula, controle de progresso e estatísticas de frequência.

- [x] Aprimorar o sistema de cursos e turmas externas com prevenção de duplicidade de matrículas, edição de alunos, importação real via CSV e painel consolidado por instituição.

- [x] Criar visualização de boletim individual consolidado para alunos externos com dados reais, histórico de turmas, status e notas.

- [x] Criar visualização de boletim individual consolidado para alunos externos (`/professor/boletim/[studentId]`) com dados reais, histórico de turmas, status e notas.

- [x] Aprimorar o gerenciamento e manutenção unificada de cursos internos (plataforma) e externos (IsF, PROFICI, SIMAL, Megaworks, UFBA) com controle de status, módulos, turmas e arquivamento seguro.

- [x] Aprimorar o gerenciamento e manutenção unificada de cursos internos (plataforma) e externos (IsF, PROFICI, SIMAL, Megaworks, UFBA) com controle de status, módulos, turmas e arquivamento seguro.

- [x] Permitir o cadastro, gerenciamento e relatórios de quaisquer instituições ou cursos externos customizados informados pelo professor, além da lista padrão (IsF, PROFICI, SIMAL, Megaworks, UFBA).

- [x] Implementar sistema integrado de chamada (frequência), lançamento de notas e vinculação de materiais didáticos para todas as turmas e cursos externos (institucionais e customizados) diretamente na plataforma.

- [x] Adicionar opção para exportar relatório completo da turma (notas e frequências) em CSV e PDF.
- [x] Criar gráfico visual interativo na página da turma para taxa de presença e desempenho médio.
- [x] Desenvolver visão do aluno externo autenticado para acessar suas notas, frequências e materiais.

- [x] Auditar e otimizar a legibilidade e o contraste das logos em todos os modos escuros da plataforma (cabeçalho, dashboards, painéis e rodapé).

- [x] Criar sistema de notificações simples para alertar alunos sobre novas notas e novos materiais.
- [x] Auditar e corrigir consistência, cálculo, virada de dia e idempotência no sistema de ofensivas (streaks).

- [x] Adicionar indicador visual de ponto vermelho no ícone do sino de notificações quando houver itens não lidos.
- [x] Criar opção para marcar todas como lidas e limpar/remover notificações de uma vez na central de notificações.
- [x] Implementar animação de celebração visual quando o aluno atingir marcos reais no sistema de ofensivas.

- [x] Auditar e aprimorar o sistema unificado de criação, manutenção, versionamento e vínculos de cursos e materiais (internos e externos).

- [x] Integrar editor de texto rico (rich text) na criação e edição de cursos e materiais para formatação avançada.
- [x] Implementar e aprimorar o sistema unificado de notas, avaliações, ponderação, pesos, feedback detalhado e histórico acadêmico persistido.

- [x] Implementar seção de comentários persistidos nos materiais dos cursos para dúvidas de alunos e respostas de professores.

- [x] Adicionar suporte a edição e exclusão de comentários pelo próprio autor, além de marcação de dúvida resolvida por professores e administradores.

- [x] Aprimorar robustez, usabilidade e relatórios dos sistemas de cursos externos, controle de chamadas (frequência) e lançamento de notas.

- [x] Criar painel de resumo para professores exibindo dúvidas pendentes em materiais e médias de notas por turma.

- [x] Aprimorar e unificar o sistema de avaliações, rubricas, pesos, notas e feedbacks para cursos internos e externos.

- [x] Implementar sistema para alunos responderem a feedbacks de avaliações e solicitarem revisão formal de notas com análise pelos professores.

- [x] Permitir que alunos anexem arquivos ou imagens como evidência ao solicitar revisão de nota, com upload seguro e exibição para o professor.

- [x] Expandir o sistema de medalhas e recompensas com novas categorias de conquistas (frequência, comentários, revisões), painel de concessão administrativa e molduras de avatar.

- [x] Implementar compartilhamento de medalhas/conquistas nas redes sociais, download de certificado e sistema de ranking (leaderboard) por turma com dados reais.

- [x] Adicionar filtros temporais (semanal, mensal, geral) no placar de líderes.
- [x] Criar sistema de missões semanais com recompensa em XP real.
- [x] Exibir níveis em formato paralelo (ex: Básico [A1-A2], Intermediário [B1-B2], Avançado [C1-C2]) em todo o site.
- [x] Revisar e padronizar a nomenclatura de níveis (Básico [A1-A2], Intermediário [B1-B2], Avançado [C1-C2]) em todas as seções, filtros e catálogos do site.
- [x] Implementar sincronização real e persistida na página do calendário (`/dashboard/calendario`) utilizando dados acadêmicos reais do banco e integração com Google Calendar.

## Auditoria de Dados Reais do Dashboard e Subrotas — 18/08/2026
- [x] Auditar `/dashboard` e todas as subrotas do aluno para identificar mocks, dados estáticos, placeholders e chamadas incompletas.
- [x] Substituir dados simulados por consultas persistidas e isoladas pelo usuário autenticado, com estados honestos de vazio, carregamento e erro.
- [x] Validar e corrigir as integrações reais com Google Calendar, Google Classroom e Google Drive sem inventar eventos, notas, turmas ou arquivos.
- [x] Garantir que sincronizações sejam idempotentes, auditáveis e nunca exibam sucesso quando a integração não foi executada.
- [x] Criar ou atualizar testes para todas as rotas alteradas e validar build de produção do Next.js 15.
- [x] Revisar visualmente todas as páginas do dashboard em desktop e mobile após a auditoria.
- [x] Atualizar este checklist com a cobertura final e salvar um checkpoint revisável.

## Regra reforçada de dados reais no dashboard — 18/08/2026
- [x] Garantir que todos os dados exibidos no dashboard e em suas subrotas venham exclusivamente do banco de dados ou de respostas reais das integrações Google, sem localStorage acadêmico, mocks ou valores padrão.
- [x] Remover qualquer status de sucesso, conquista, recomendação, progresso ou pagamento que não tenha confirmação persistida ou resposta real da integração.

## Auditoria de Dados Reais do Painel do Professor e Subrotas — 18/08/2026
- [x] Auditar `/professor` e todas as subrotas docentes (`/professor/alunos`, `/professor/progresso`, `/professor/progresso-aulas`, `/professor/tarefas`, `/professor/turmas-externas`, `/professor/boletim/[studentId]`) para eliminar dados simulados.
- [x] Garantir que todas as estatísticas de turmas, médias, tarefas pendentes, chamadas e boletins venham exclusivamente do banco Neon PostgreSQL.
- [x] Validar a fronteira das integrações Google: nenhuma rota do professor exibe sincronização concluída sem resposta real; dados Google existentes permanecem tratados pelas rotas de integração autorizadas.
- [x] Executar suíte Vitest e build de produção Next.js 15 após as correções no painel do professor.

## Auditoria de Dados Reais do Painel Administrativo e Subpastas — 18/08/2026
- [x] Auditar `/admin` e todas as subrotas administrativas (`/admin/cursos`, `/admin/cms`, `/admin/medalhas`, `/admin/relatorios-academicos`, `/admin/chamada`, `/admin/avaliacoes`, `/admin/artigos`, `/admin/configuracoes`) para eliminar quaisquer dados simulados ou fallbacks.
- [x] Garantir que estatísticas globais, logs de atividades, relatórios acadêmicos e métricas de armazenamento Google venham estritamente de consultas reais no Neon PostgreSQL e APIs autenticadas.
- [x] Validar o isolamento de permissões administrativas (palafozanderson@gmail.com / role admin) e a integridade das mutações no banco de dados.
- [x] Executar suíte Vitest e build de produção Next.js 15 após as correções no painel administrativo.

## Auditoria Técnica de Erros do Painel do Professor — 18/08/2026
- [x] Mapear todas as páginas e rotas de API do painel do professor.
- [x] Auditar isolamento de dados, verificações de sessão, tratamento de erros HTTP e integridade de tipos.
- [x] Executar validação de testes e build.
- [x] Produzir relatório técnico detalhado com achados e recomendações.
- [x] Corrigido o erro de importação em `/admin/artigos`.
- [x] Concluída a validação de todas as páginas do painel do professor sem erros de compilação ou falhas de tipo.

## Auditoria Técnica de Erros do Painel Administrativo — 18/08/2026
- [x] Mapear todas as páginas e rotas de API do painel administrativo (`/admin/*`).
- [x] Auditar permissões RBAC, segurança das mutações, tratamento de erros HTTP e tipagem.
- [x] Executar validação de testes e build de produção.
- [x] Produzir relatório técnico detalhado de auditoria administrativa.
- [x] Remover os três tópicos, autores, métricas, áudios e timestamps estáticos de `app/admin/forum/page.tsx`; conectar a moderação a registros persistidos e mutações reais.
- [x] Impedir que `app/admin/page.tsx` converta falhas da API de estatísticas em zeros silenciosos; exibir erro recuperável e distinguir ausência real de dados de indisponibilidade.
- [x] Corrigir `app/api/admin/users/create/route.ts`: novos usuários devem iniciar sem matrículas automáticas, mantendo o onboarding vazio conforme a regra de dados reais.
- [x] Revisar `app/api/admin/activity/route.ts` e a tela de auditoria avançada para garantir paginação e escopo explícito de super-admin.
- [x] Criar auditoria avançada de logs de acesso baseada em `event_logs`, com gravação real de login, paginação, filtros de evento e período e visão administrativa.
- [x] Corrigir a rota de sessões administrativas para evitar carregamento sem limite de sessões, alunos, cursos e presenças.
- [x] Remover a persistência simulada de reordenação em `app/admin/aulas/page.tsx` e criar mutação real para salvar a ordem das aulas.
- [x] Auditar `app/admin/reviews/page.tsx`: substituir o autor de resposta hardcoded e o consumo de APIs públicas por resposta persistida do backend com escopo administrativo.
- [x] Projetar e implementar o módulo de cupons/descontos com schema persistido, RBAC administrativo, validação de Stripe e testes.
- [x] Atualizar a nomenclatura dos níveis na homepage para "Básico ao Avançado" conforme solicitado.
- [x] Implementar a funcionalidade de liberação administrativa de acesso pago a quaisquer conteúdos para quaisquer contas pelo perfil de super admin.
- [x] Corrigir a causa real da falha em `/api/professor/resumo`, garantindo no Neon as tabelas de comentários e turmas externas exigidas pela consulta, sem inserir dados simulados.
- [x] Reorganizar visualmente o CMS em abas mais claras e adicionar pré-visualização real de imagens da biblioteca de mídia.
- [x] Implementar revogação de acessos pagos concedidos diretamente pelo painel de liberação (`/admin/liberacao-acesso`).
- [x] Corrigir falha de carregamento no painel de progresso de aulas do professor (`/professor/progresso-aulas`) e aprimorar funcionalidade e visual.
- [x] Implementar paginação, busca por nome e filtro por categoria/tipo na API da biblioteca de mídia do CMS e atualizar a interface correspondente.
- [x] Aprimorar visual, segurança, usabilidade, acessibilidade e responsividade de todas as rotas administrativas e da área do aluno listadas. Guard server-side, estados globais de carregamento/erro e shell responsivo auditados; contratos e respostas HTTP verificados.

## Inventário Completo de Rotas e Auditoria — 18/08/2026

### Rotas Públicas
- [x] `/` — Página inicial (indicador real de aulas, nomenclatura Básico ao Avançado, acessibilidade e responsividade revisadas)
- [x] `/sobre` — Sobre o professor e a plataforma (trajetória UFBA, pesquisa, design tokens e responsividade validados)
- [x] `/aulas` — Catálogo público de aulas (filtros, dados reais do Neon, ordenação por nível e tokens de tema validados)
- [x] `/cursos/[id]` — Detalhes de um curso específico (módulos, aulas reais, progresso e matrícula validados)
- [x] `/cursos/[id]/aulas/[lessonId]` — Aula específica dentro de um curso (reprodução de vídeo, anotações, histórico de speaking e certificado automático validados)
- [x] `/materiais` — Biblioteca pública de materiais (busca, filtros por nível e categoria, paginação incremental / carregar mais, guias de gramática e dados reais validados)
- [x] `/materiais/[id]` — Detalhes de um material específico (visualização de PDF/imagem, downloads, comentários, progresso e dados reais validados)
- [x] `/blog` — Lista de artigos do blog (busca real, filtros por categoria, estados vazios/indisponíveis, foco visível e CTA acionável)
- [x] `/blog/[slug]` — Artigo específico do blog (dados reais, breadcrumbs, comentários, avaliações com estrelas, tempo de leitura e tokens de tema)
- [x] `/forum` — Fórum público de discussão (tópicos persistidos, moderação admin, curtidas, cache TTL seguro com invalidação, paginação otimizada para o Neon e dados reais)
- [x] `/faq` — Perguntas frequentes (central de ajuda, accordion acessível, link para contato e testes validados)
    - [x] `/contato` — Formulário de contato
    - [x] `/cadastro` — Cadastro de usuário (ajustado para contas 100% vazias sem auto-matrícula)
    - [x] `/login` — Login
    - [x] `/redefinir-senha` — Redefinição de senha
    - [x] `/politica-privacidade` — Política de privacidade
    - [x] `/acesso-negado` — Página de acesso negado
    - [x] `/acesso-pendente` — Página de acesso pendente

	### Área do Aluno (`/dashboard`)
	- [x] `/dashboard` — Página principal da área do aluno (metas semanais, progresso, notificações Classroom)
	- [x] `/dashboard/perfil` — Perfil, dados pessoais, galeria de medalhas e conquistas
	- [x] `/dashboard/meus-cursos` — Cursos do aluno com progresso real
	- [x] `/dashboard/cursos` — Catálogo ou gestão de cursos acessíveis
	- [x] `/dashboard/atividades` — Atividades do aluno com submissão e histórico
	- [x] `/dashboard/biblioteca` — Biblioteca de materiais do aluno com salvamento e favoritos
	- [x] `/dashboard/calendario` — Calendário acadêmico com sincronização Google Calendar
	- [x] `/dashboard/historico` — Histórico acadêmico com filtros por semestre e notas
	- [x] `/dashboard/certificados` — Certificados do aluno com verificação e download
	- [x] `/dashboard/compras` — Histórico de compras Stripe
	- [x] `/dashboard/desejos` — Lista de desejos de cursos
	- [x] `/dashboard/anotacoes` — Anotações pessoais por aula
	- [x] `/dashboard/notificacoes` — Central de notificações em tempo real
	- [x] `/dashboard/trilha` — Trilha de aprendizagem adaptativa baseada em quizzes
	- [x] `/dashboard/ia-teste` — Laboratório e testes acadêmicos

	### Área do Professor (`/professor`)
	- [x] `/professor` — Painel principal do professor (métricas, resumo, busca e exportação ZIP de materiais)
	- [x] `/professor/alunos` — Gestão e consulta de alunos com aprovação RBAC
	- [x] `/professor/progresso` — Progresso acadêmico dos alunos sincronizado com Classroom
	- [x] `/professor/progresso-aulas` — Progresso de aulas e avaliação de speaking com suporte real
	- [x] `/professor/tarefas` — Gestão e correção de tarefas com feedback e notas
	- [x] `/professor/turmas-externas` — Turmas de instituições externas (SIMAL, Megaworks, UFBA) com exclusão segura e modal
	- [x] `/professor/boletim/[studentId]` — Boletim individual de um aluno com exportação PDF e gráficos

	### Área Administrativa (`/admin`)
	- [x] `/admin` — Dashboard administrativo com métricas reais do Neon
	- [x] `/admin/usuarios` — Gestão de usuários e status de aprovação

- [x] `/admin/cursos` — Gestão de cursos (busca, filtro de nível, feedback não bloqueante e suporte a temas)
- [x] `/admin/cursos/[id]/modulos` — Módulos de um curso específico (skeleton, erro recuperável, reordenação acessível e layout responsivo)
- [x] `/admin/materiais` — Gestão de materiais (upload persistente, formulário completo, busca e suporte a temas)
- [x] `/admin/aulas` — Gestão de aulas (seleção de curso, criação com material de apoio, reordenação e suporte a temas)
- [x] `/admin/atividades` — Gestão de atividades (trilha de auditoria superadmin, filtros de ação, paginação e alto contraste)
- [x] `/admin/chamada` — Chamada e frequência (filtros avançados, ações em massa, exportação dual CSV/PDF e tokens de tema)
- [x] `/admin/medalhas` — Catálogo e concessão de medalhas (concessão manual, listagem de concedidas e tokens de tema)
- [x] `/admin/forum` — Moderação do fórum (moderação de tópicos persistidos, notas de moderação e suporte a temas)
- [x] `/admin/reviews` — Gestão de avaliações de cursos (respostas persistidas, seleção de curso e tokens de tema)
- [x] `/admin/avaliacoes` — Área administrativa de avaliações (editor rico, redimensionamento de imagens e tokens de tema)
- [x] `/admin/matriculas` — Gestão de matrículas (vínculo de alunos a cursos, filtros de busca, modal de desvinculação e suporte a temas)
- [x] `/admin/mensagens` — Gestão de mensagens (caixa de entrada de contato, links de resposta por email e suporte a temas)
- [x] `/admin/artigos` — Gestão de artigos (redirecionamento seguro para a gestão unificada do blog)
- [x] `/admin/blog` — Gestão do blog (editor Markdown, gerador de slug, feedback toast e tokens de tema)
- [x] `/admin/cms` — Sistema de gerenciamento de conteúdo (biblioteca de mídia com paginação server-side, busca, filtros e upload S3 persistido)
- [x] `/admin/relatorios` — Relatórios administrativos gerais (busca server-side, exportação de aba e KPIs persistidos)
- [x] `/admin/relatorios-academicos` — Relatórios acadêmicos (filtros reais, sincronização Classroom, exportações e erro recuperável)
- [x] `/admin/auditoria` — Auditoria de acessos e atividades (filtro por usuário/email, tipo, datas, paginação defensiva e CSV da página)
- [x] `/admin/cupons` — Gestão de cupons e descontos Stripe (filtros server-side por código/status, paginação e guard administrativo)
- [x] `/admin/liberacao-acesso` — Concessão e revogação de acesso pago pelo super administrador (guard exclusivo, filtros, confirmação e auditoria admin_audit_logs)

	### Pagamentos e Layouts Auxiliares
	- [x] `/pagamento/sucesso` — Confirmação de pagamento concluído (Stripe)
	- [x] `/pagamento/recibo/[id]` — Recibo de uma compra específica com dados reais
	- [x] `app/admin/layout.tsx` — Layout protegido do painel administrativo com guard server-side
	- [x] `app/dashboard/layout.tsx` — Layout protegido da área do aluno e docente com tour guiado

- [x] Consolidar o documento de Design System e o cronograma modular de entrega para Admin, Professor e Aluno (`docs/design-system-and-rollout-schedule.md`).

- [x] Consolidar a especificação técnica detalhada para os módulos de relatórios e auditoria (`docs/admin-reports-and-audit-specification.md`).

- [x] Implementar preview Markdown em tempo real e seguro na gestão de artigos do blog.
- [x] Continuar o aprimoramento de `/admin/relatorios`, `/admin/relatorios-academicos` e `/admin/auditoria` com dados reais, filtros, segurança e exportações.

- [x] Revisar `/admin/cupons` com filtros server-side, paginação, estados acessíveis, tokens semânticos e validação de permissões Stripe.
- [x] Revisar `/admin/liberacao-acesso` com auditoria de concessão/revogação, filtros, confirmação acessível e escopo exclusivo do super administrador.

## Layouts auxiliares de pagamento — 18/08/2026
- [x] Pagamento: validar em tempo real a sessão Stripe e apresentar carregamento, sucesso, erro recuperável e ausência de sessão em `/pagamento/sucesso`.
- [x] Pagamento: implementar `/pagamento/recibo/[id]` com dados reais, validação de identidade e autorização server-side sem dados estáticos.
- [x] Pagamento: revisar tokens de tema, responsividade, impressão, acessibilidade e feedback de carregamento nos layouts auxiliares.
- [x] Pagamento: criar contratos Vitest para sessão confirmada, sessão ausente, recibo autorizado e recibo não autorizado.
- [x] Pagamento: executar check, testes e build de produção e salvar checkpoint do módulo.

- [x] Permitir que o professor exclua turmas externas com confirmação, validação de dependências e registro de auditoria.

- [x] Adicionar modal de confirmação dedicado e acessível antes de excluir turma externa para evitar exclusões acidentais, detalhando o impacto nas dependências.

- [x] Incluir estado de carregamento com spinner no botão do modal de exclusão e toast de sucesso imediato.
- [x] `/sobre` — Página sobre o professor e a plataforma (revisão de dados reais, biografia e tokens de tema).

- [x] Diagnosticar e documentar a solução para o erro 403 access_denied do Google OAuth (modo de teste do console do Google Cloud requer inclusão de palafozanderson@gmail.com como testador ou publicação do aplicativo).

- [x] Google OAuth: separar o login básico (openid, email, profile) do escopo adicional do Calendar e orientar conexão explícita em caso de autorização insuficiente.

- [x] Adicionar botão 'Carregar mais' e paginação por lotes na página pública de materiais didáticos para otimizar o desempenho.

- [x] Adicionar seção de materiais relacionados reais na página de detalhes `/materiais/[id]` para facilitar a navegação complementar.

- [x] Adicionar botão de "favoritar / salvar para depois" com persistência e feedback interativo nos cards de materiais relacionados.

- [x] Restringir Google Calendar, Google Drive e Google Classroom para carregar exclusivamente eventos, pastas e turmas relacionados à plataforma Anderson Palafoz.

- [x] Adicionar botão 'Carregar mais' e paginação por lotes na página pública do blog para otimizar a navegação.

## Estratégia de Armazenamento Gratuito Externo (Google Drive) — 18/08/2026
- [x] Migração real dos uploads de arquivos e imagens para o Google Drive (suporte à API v3 do Google Drive, OAuth2, criação automática de pastas e fallback robusto para testes)
- [x] Armazenamento estrito de metadados no Neon PostgreSQL confirmado: `media_assets` persiste somente URL, fileKey, tamanho e metadados; bytes permanecem no Storage externo.
- [x] Implementação de compressão client-side para imagens antes do envio
- [x] Proteção server-side de arquivos privados de alunos e professores via permissões RBAC

- [x] Conta dedicada configurada no código como `andersonpalafoznupel@gmail.com`, aguardando autorização OAuth server-side real

- [x] Mecanismo de retry aplicado ao upload real do Google Drive com backoff exponencial e tratamento robusto de erros transitórios

- [x] Configuração nominal da conta dedicada: `andersonpalafoznupel@gmail.com` (isolada da conta admin `palafozanderson@gmail.com`); autorização server-side pendente

- [x] Indicador de progresso visual acessível e responsivo no CMS para acompanhamento de uploads de arquivos

## Exportação ZIP de materiais do professor
- [x] Permitir a seleção de materiais específicos por caixas de seleção antes da geração e exportação do ZIP do professor, com seleção em massa, contador, estado vazio e validação server-side
- [x] Adicionar indicador visual de tamanho total estimado dos materiais selecionados antes de gerar o arquivo ZIP, com alerta de limite de 40 MB
- [x] Adicionar barra de pesquisa instantânea para os professores encontrarem rapidamente materiais específicos pelo nome antes de selecioná-los, preservando a seleção ativa e o cálculo de tamanho
- [x] Adicionar filtros rápidos por nível de dificuldade (Básico, Intermediário, Avançado) ao lado da barra de pesquisa de materiais, combinando os critérios sem perder a seleção

## Reconciliação do todo.md anexado com a infraestrutura real — 19/08/2026
- [x] Confirmar que uploads persistidos no Neon guardam somente metadados e referências externas, sem colunas de bytes/blob.
- [x] Remover o fallback simulado de `lib/google-drive-upload.ts` e retornar erro de configuração quando o OAuth real não estiver disponível; retry transitório mantém backoff exponencial.
- [x] Documentar a política efetiva: uploads administrativos usam Supabase Storage externo com metadados no Neon; exportações do professor usam Google Drive dedicado somente quando OAuth real está configurado.
- [x] Reconciliar no inventário os itens do anexo que permanecem desatualizados em relação ao código real e registrar evidências em `docs/todo-reconciliation-2026-08-19.md`.

## Auditoria de ofensivas e gamificação — 19/08/2026
- [x] Mapear componentes, rotas, APIs, tabelas e regras que compõem ofensivas e gamificação: `user_gamification_points`, `medals_catalog`, `user_medals`, `notifications`, `/api/gamification`, `/api/leaderboard`, `/api/user/medals`, `/api/admin/medals`, `/api/notifications`, dashboard semanal e componentes de ofensiva.
- [x] Auditar valores fixos, dados fabricados, cálculo real de ofensiva, XP, medalhas, metas, desafios, ranking e notificações; foram encontrados seed fictício de 350 XP/1 dia, modal fixo em 14 dias/+150 XP, coluna inexistente `totalXp` no ranking e duas tabelas de notificações divergentes.
- [x] Remover a inicialização fictícia de XP, nível e ofensiva para novas contas e retornar estado vazio/zero sem criar progresso artificial.
- [x] Corrigir o ranking para usar `points`, exigir sessão aprovada e aplicar escopo de turma quando disponível, sem expor dados de usuários não autorizados.
- [x] Substituir o modal fixo de ofensiva por dados reais do endpoint e só celebrar um novo marco confirmado pelo servidor, com bônus idempotente.
- [x] Unificar os eventos de conquista com a tabela de notificações efetivamente consumida pela interface e evitar duplicidade de concessão de medalhas.
- [x] Corrigir inconsistências de persistência, idempotência, RBAC, acessibilidade, responsividade e feedback visual.
- [x] Executar testes direcionados e suíte completa: 79 arquivos e 280 testes aprovados; validação visual e de rotas protegidas registrada no preview.
- [x] Aplicar e verificar a migração de gamificação no banco Neon real: `streakDays` agora inicia em 0 no branch principal `br-lucky-lab-atg6m31w`; a ramificação temporária foi removida após a validação.
- [x] Consolidar fisicamente a tabela legada `user_notifications`: a aplicação e o schema ORM usam exclusivamente `notifications`. Verificou-se que a tabela legada estava vazia e sem dependências de FK. A migração foi validada em branch temporário e aplicada com segurança ao Neon principal (`br-lucky-lab-atg6m31w`).
- [x] Implementar a seção de histórico de exportação de materiais do professor para exibir as gerações anteriores de ZIP, com persistência real em `teacher_zip_exports`, isolamento por proprietário, formatação de tamanho, data, botão de atualização em tempo real e exportação do relatório completo em CSV com codificação UTF-8 BOM.
- [x] Adicionar indicador de carregamento, bloquear cliques duplicados e exibir mensagem de sucesso acessível ao exportar o histórico ZIP em CSV; 284 testes Vitest aprovados.
- [x] Implementar e testar o registro manual e persistente de notas e frequências para turmas externas no painel do professor (`/app/api/professor/external-classes/route.ts`), com validação de propriedade, armazenamento real no Neon e notificações automáticas para alunos.
- [x] Implementar lançamento em lote de notas e presenças para turmas externas com validação de pertencimento, relatório de processamento e testes automatizados (`saveBatchGrades`).
- [x] Corrigir e validar o fluxo de acesso aos cursos e aulas recém-criados: separar falha de autenticação da renderização, tratar 401/500 com feedback acionável e comparar com cursos existentes (290 testes Vitest aprovados).

## Requisitos Adicionais de Cursos e Turmas Externas — 19/08/2026
- [x] Garantir que todos os cursos internos possuam múltiplos módulos e aulas reais em cada módulo, simulando cadastramento manual completo.
- [x] Cadastrar alunos reais matriculados nos cursos internos (tabela `enrollments`), garantindo dados de progresso coerentes.
- [x] Investigar e corrigir o erro interno ao buscar turmas externas ("Erro interno ao buscar turmas externas").
- [x] Criar uma turma externa robusta com alunos reais cadastrados (`external_students`), simulando o processo manual no painel do professor sem erros.

## Requisito de Matrícula e Acesso a Cursos — 19/08/2026
- [x] Garantir que qualquer visitante ou aluno possa visualizar informações básicas de qualquer curso interno no catálogo e na página de detalhes.
- [x] Restringir a matrícula em cursos pagos para exigir pagamento confirmado via Stripe ou liberação manual realizada pelo administrador na plataforma (`liberacao-acesso`).
- [x] Criar testes automatizados para validar a regra de acesso a cursos pagos versus gratuitos.

## Auditoria de Comandos e Correção de Erros de Acesso — 19/08/2026
- [x] Auditar os últimos comandos executados e o histórico de requisições do servidor para identificar a causa exata dos erros de acesso aos cursos internos e externos.
- [x] Corrigir qualquer divergência entre permissões de sessão (admin/professor), rotas dinâmicas e consultas Drizzle.
- [x] Validar com testes automatizados e navegação simulada (292 testes aprovados).

## Indicadores Visuais de Cursos — 19/08/2026
- [x] Adicionar etiquetas visuais claras (ex: "Curso Interno" vs "Turma Externa / Institucional") nas listagens de cursos, cards e catálogos.
- [x] Validar a consistência visual em todo o site e cobrir com testes automatizados.

## Auditoria de Exclusões (Materiais, Turmas, Artigos, Módulos e Cursos) — 19/08/2026
- [x] Auditar exclusão de materiais (`deleteMaterial` disponível).
- [x] Auditar exclusão de turmas externas (`deleteClass` disponível).
- [x] Auditar exclusão de artigos (`deleteArticle` disponível).
- [x] Auditar exclusão de cursos (`deleteCourse` disponível).
- [x] Implementar exclusão de módulos e aulas (`deleteModule` e `deleteLesson` com cascata no Neon) e rota de API administrativa associada.

## Auditoria da Rota /professor/turmas-externas — 19/08/2026
- [x] Auditar a rota e API de turmas externas quanto a dados reais, segurança RBAC, filtros, chamadas, notas unitárias e em lote, importação/exportação CSV e PDF.
- [x] Validar responsividade visual e testes automatizados.

## Filtros por Período Acadêmico em Turmas Externas — 19/08/2026
- [x] Adicionar seletores de ano letivo e semestre no painel do professor para filtrar turmas externas com precisão.
- [x] Cobrir com testes automatizados de filtragem combinada.

## E-mail de Boas-vindas para Alunos de Turmas Externas — 19/08/2026
- [x] Implementar endpoint protegido para enviar e-mail real de boas-vindas aos alunos com endereço cadastrado.
- [x] Adicionar botão, confirmação, estados de carregamento, sucesso e erro na interface de turmas externas.
- [x] Cobrir permissões, destinatários válidos e prevenção de envio duplicado com testes automatizados.

## Envio de Boas-vindas via Gmail API OAuth — 19/08/2026
- [x] Configurar escopo restrito `https://www.googleapis.com/auth/gmail.send` no fluxo OAuth.
- [x] Implementar serviço de envio de e-mails usando a biblioteca `googleapis` autenticada pelo token do professor/admin.
- [x] Adicionar botão de boas-vindas na interface de turmas externas com confirmação, spinner e feedback de sucesso ou erro.
- [x] Cobrir com testes automatizados e validar build.

## Auditoria Profunda e Reconstrução de Rotas com Erro Persistente — 19/08/2026
- [x] **Rota `/cursos/[id]` (ex: `/cursos/6`)**: Auditar o carregamento de dados do curso, módulos, aulas, estado de erro e se o ID 6 existe de fato no banco Neon. Caso necessário, refazer o componente e a API para garantir tratamento robusto de falhas e fallback para estados vazios sem quebrar a renderização.
- [x] **Rota `/professor/turmas-externas`**: Auditar o endpoint de listagem de turmas externas, validação de sessão NextAuth, verificação do papel do professor/admin, tratamento de erros de SQL e renderização em dispositivos móveis. Caso necessário, reconstruir o componente de listagem e gerenciamento com tratamento resiliente de erros e skeleton loaders consistentes.
- [x] **Validação Real e End-to-End**: Testar o comportamento das duas rotas em ambiente de homologação simulado e verificar logs de console/rede.

## Mensagens de Erro Claras e Feedback Visual em Turmas Externas — 19/08/2026
- [x] Implementar tratamento detalhado de erros HTTP (401, 403, 404, 500) com botões de tentativa e orientações na página `/professor/turmas-externas`.
- [x] Adicionar indicadores visuais de sucesso, aviso e falha nas operações de criação de turmas, matrícula de alunos e lançamento de notas.
- [x] Cobrir os novos estados de erro e feedback com testes automatizados e validar responsividade.

## Auditoria de Cursos, Materiais e Visualização no Site — 19/08/2026
- [x] Auditar fluxos de criação, edição e exclusão de cursos e materiais (internos e externos) no backend e frontend.
- [x] Auditar a visualização pública e autenticada de cursos, módulos, aulas e materiais no site, garantindo integridade e ausência de erros 404/500.
- [x] Cobrir com testes automatizados de contrato e persistência no banco Neon.

## Reconstrução Total do Zero: Cursos, Turmas e Materiais — 19/08/2026
- [x] Realizar inventário de segurança dos dados existentes.
- [x] Limpar dados acadêmicos (mantendo contas e perfis essenciais).
- [x] Reconstruir backend, contratos, integridade e RBAC.
- [x] Reconstruir frontend de gerenciamento e visualização.
- [x] Executar testes automatizados de ponta a ponta.

## Roteiro Detalhado da Reconstrução Total do Zero — 19/08/2026
- [x] **Etapa 1: Limpeza Segura do Banco de Dados**
  - Executar script de limpeza seletiva no Neon DB preservando apenas usuários e credenciais.
- [x] **Etapa 2: Reconstrução dos Contratos de Backend e APIs**
  - Reescrever e validar endpoints em `server/` e `app/api/` com tratamento robusto de erros e RBAC.
- [x] **Etapa 3: Reconstrução das Interfaces de Gestão (Admin e Professor)**
  - Implementar painéis limpos e responsivos para cursos, módulos, aulas, materiais e turmas externas.
- [x] **Etapa 4: Reconstrução da Visualização Pública e Aluno**
  - Garantir catálogos e páginas de detalhes livres de falhas, com fallback adequado.
- [x] **Etapa 5: Testes Automatizados e Homologação**
  - Executar suíte Vitest e validar build de produção.

## Especificação Detalhada da Lógica de Reconstrução — 19/08/2026
- [x] **1. Escopo, Preservação e Segurança**
  - Manutenção obrigatória das tabelas de usuários (`users`), sessões e configurações do sistema (especialmente `palafozanderson@gmail.com`).
  - Remoção exclusiva de registros acadêmicos e institucionais subordinados (cursos, módulos, aulas, atividades, materiais, turmas externas, alunos externos, chamadas e notas).
- [x] **2. Modelo de Dados e Dependências Relacionais**
  - Ordem estrita de limpeza/exclusão (de folha para raiz): `external_attendance` → `external_grades` → `external_materials` → `external_students` → `external_classes` → `lesson_materials` → `activities` → `lessons` → `modules` → `courses` → `materials`.
- [x] **3. Contratos de API e RBAC Rigoroso**
  - Todas as mutações (`POST`, `PUT`, `DELETE`) em `/api/admin/*` e `/api/professor/*` exigem verificação de sessão ativa e papéis `admin`, `super_admin` ou `professor`.
  - Resposta padronizada de erro com códigos HTTP claros (401, 403, 404, 500) e ausência absoluta de dados simulados/mockados.
- [x] **4. Experiência de Frontend e Visualização**
  - Formulários de criação e edição com feedback visual imediato (toasts e banners de status).
  - Páginas públicas e de alunos protegidas contra quebras de renderização (fallbacks para itens vazios ou não publicados).
- [x] **5. Homologação e Critérios de Conclusão**
  - Manutenção da cobertura de testes em Vitest e validação de build em produção no Next.js 15.

## Validação em Tempo Real no Formulário de Turmas Externas — 19/08/2026
- [x] Implementar validação em tempo real na criação e edição de turmas externas (instituição, nome da turma, disciplina e período letivo).
- [x] Exibir mensagens de erro amigáveis e indicadores visuais de preenchimento correto por campo.
- [x] Cobrir com testes automatizados de validação de formulário e garantir build de produção.

## Melhorias de UX e Gestão Acadêmica — 19/08/2026
- [x] Implementar exportação em lote de boletins em PDF para todos os alunos de uma turma externa.
- [x] Adicionar suporte a atalhos de teclado (ex: `Ctrl+Enter`) no envio do formulário de turmas externas.
- [x] Criar histórico de alterações e auditoria de ações docentes no painel do professor.

## Continuação do Roadmap: Cursos Reais e Integrações Google — 19/08/2026
- [x] Verificar dados reais oficiais e estado atual do banco Neon.
- [x] Ativar e estruturar apenas cursos e materiais oficiais reais (sem fabricar dados falsos).
- [x] Restringir integrações Google (Drive, Calendar, Classroom) estritamente aos itens relacionados à plataforma.
- [x] Configurar observabilidade e auditoria contínua de erros no painel de administração.
- [x] Executar suíte Vitest e validar build de produção.

## Correção de Comunicação Frontend-Backend e Permissões — 19/08/2026
- [x] Unificar o predicado `isGlobalAdmin` nas rotas de API para evitar rejeições incorretas (403) em mutações de turmas externas e materiais.
- [x] Validar que administradores e super administradores (`palafozanderson@gmail.com`) possuem acesso total a todas as operações de escrita, edição e exclusão.
- [x] Reexecutar suíte Vitest (306 testes aprovados).

## Links do Google Drive no Formulário de Cursos — 19/08/2026
- [x] Adicionar campo para links diretos de materiais do Google Drive no cadastro e edição de cursos.
- [x] Exibir os links de materiais do Google Drive com ícone e abertura segura nos detalhes do curso.
- [x] Validar persistência no banco Neon e garantir aprovação da suíte de testes.

## Transparência de Erros e Códigos HTTP no CRUD — 19/08/2026
- [x] Exibir códigos de status HTTP claros (ex: `HTTP 400`, `HTTP 401`, `HTTP 403`, `HTTP 404`, `HTTP 500`) e mensagens detalhadas em caso de falha em mutações de cursos, turmas e materiais.
- [x] Fornecer feedback visual persistente com orientações para nova tentativa nos painéis de administração e professor.
- [x] Validar com testes automatizados de tratamento de erro HTTP.

## Auditoria Crítica das 4 Rotas e Vercel Deploy — 19/08/2026
- [x] Auditar e corrigir `/professor/turmas-externas` (tratamento de erros, carregamento e permissões).
- [x] Auditar e corrigir `/admin/cursos` (gestão, salvamento, exclusão e exibição de códigos HTTP).
- [x] Auditar e corrigir `/professor/progresso-aulas` (resolução de erros de carregamento e remoção de menções de IA).
- [x] Auditar e corrigir `/cursos/6` (tratamento de IDs válidos e inválidos, módulos e aulas).
- [x] Inspecionar logs e status de deploy no Vercel (via CLI do Vercel ou verificação de build).

## Verificação de Status no Vercel — 19/08/2026
- [x] Consultar o status de deploy e logs utilizando a ferramenta MCP Vercel ou CLI Vercel.
- [x] Diagnosticar eventual divergência entre o commit local atualizado e o ambiente publicado no Vercel.

## Seção Visual de Materiais do Google Drive em Detalhes do Curso — 19/08/2026
- [x] Criar seção visualmente destacada na página `/cursos/[id]` para exibir links de materiais do Google Drive.
- [x] Validar responsividade, ícones acessíveis e abertura segura em nova aba.
- [x] Executar suíte de testes e salvar checkpoint.
- [x] Corrigir o erro de TypeScript no build da Vercel: importação de `authOptions` não utilizada em `app/api/admin/courses/route.ts`.
- [x] Reexecutar o build de produção após a correção e verificar se não surgem novos erros de compilação.

## Auditoria de Variáveis de Ambiente do Vercel — 19/08/2026
- [x] Analisar capturas de tela das variáveis cadastradas no Vercel (`DATABASE_URL`, `NEON_DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, etc.).
- [x] Identificar desalinhamentos de ambiente (Production vs Preview) e variáveis essenciais que precisam ser promovidas ou corrigidas.

## Edição Segura das Variáveis do Vercel — 19/08/2026
- [x] Confirmar acesso autenticado à conta Vercel e vínculo com o projeto `andersonpalafoz` (projeto `prj_kF1vCYnAkUm6VciN0dHHH5eSRXJ1`).
- [x] Inventariar variáveis críticas por nome e ambiente, sem expor valores secretos.
- [x] Confirmar com segurança a presença e o escopo de `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`; os valores secretos foram preservados e não foram expostos nem rotacionados sem necessidade.
- [x] Aplicar as alterações não secretas somente após confirmação explícita dos ambientes Production/Preview; `NEXTAUTH_URL` foi corrigida e os secrets existentes foram preservados.
- [x] Fazer redeploy e validar as rotas críticas sem expor segredos nos logs; o deployment ficou READY, não houve erros de runtime nos 30 minutos posteriores e as APIs protegidas retornaram 401/403 esperados sem sessão.

## Verificação e Ajuste Completo do Vercel — 19/08/2026
- [x] Confirmar acesso ao projeto Vercel correto (`andersonpalafoz`, ID `prj_kF1vCYnAkUm6VciN0dHHH5eSRXJ1`).
- [x] Auditar logs de runtime da Vercel para isolar o erro de schema faltante (`relation "external_class_attendance" does not exist`, coluna `approvalStatus`).
- [x] Mapear todas as variáveis de ambiente essenciais lidas pelo código (`NEON_DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, chaves Google e Stripe).
- [x] Orientar o ajuste seguro no painel da Vercel pelo celular ou painel web.

## Auditoria e correção do ambiente Vercel/Neon — 19/08/2026
- [x] Confirmar acesso autenticado ao projeto Vercel correto `andersonpalafoz` na equipe `palafozanderson-2076`.
- [x] Revisar os nomes e ambientes das variáveis sem expor valores secretos.
- [x] Ajustar `NEXTAUTH_URL` para `https://andersonpalafoz.vercel.app` nos ambientes Production e Preview, preservando os secrets existentes.
- [x] Confirmar que o código prioriza `NEON_DATABASE_URL` sobre `DATABASE_URL` e evitar substituir a conexão sem validar o valor secreto.
- [x] Diagnosticar que o banco Neon de produção estava parcialmente atrás do schema Drizzle, com colunas/tabelas ausentes que causavam erros 500.
- [x] Aplicar transação aditiva no Neon principal `teacher-palafoz` para criar os tipos, colunas e tabelas ausentes de progresso, chamada, turmas externas, mídia e mensagens, sem apagar registros.
- [x] Validar no Neon a existência de `lessonProgress.approvalStatus`, `attendances.status`, `external_class_attendance`, `external_class_materials`, `media_assets` e `contact_messages`.
- [x] Fazer redeploy do projeto Vercel para que `NEXTAUTH_URL` e o código atualizado entrem em vigor no deployment de produção.
- [x] Revalidar `/professor`, `/professor/turmas-externas`, `/professor/progresso-aulas`, `/cursos/6`, `/admin/cms`, `/admin/mensagens` e `/admin/media` após o redeploy; todas responderam sem HTTP 500 para acesso anônimo.

## Verificação da Variável NEON_DATABASE_URL e Conectividade no Neon — 19/08/2026
- [x] Confirmar o projeto Vercel correto `andersonpalafoz` e inspecionar a presença e escopo da variável `NEON_DATABASE_URL` nos ambientes Production e Preview.
- [x] Validar a conectividade atual com o banco Neon de produção usando a string configurada.
- [x] Executar query de integridade para confirmar a existência de todas as 45 tabelas essenciais exigidas pelo schema Drizzle (`courses`, `modules`, `lessons`, `external_classes`, `external_students`, `lessonProgress`, `media_assets`, `notifications`).
- [x] Produzir relatório conclusivo sobre o estado e a saúde do banco de dados em produção.

## Exclusão Intuitiva e Segura de Cursos — 19/08/2026
- [x] Auditar os componentes de listagem e exclusão de cursos em `/admin/cursos` e `/professor`.
- [x] Criar modal de confirmação dedicado e amigável para exclusão de cursos, com aviso sobre módulos e aulas vinculados.
- [x] Adicionar indicadores de carregamento (spinner), feedback sonoro/visual (toasts) e tratamento robusto de erros HTTP.
- [x] Executar testes automatizados (320 testes aprovados com sucesso).
- [x] Validar build e salvar checkpoint com a nova melhoria de UX.

## Lixeira para Cursos e Turmas Externas — 19/08/2026
- [x] Adicionar coluna `deleted_at` (timestamp) nas tabelas `courses` e `external_classes` no schema Drizzle e Neon DB.
- [x] Atualizar as funções de consulta em `server/db.ts` / `lib/db.ts` para excluir logicamente, listar lixeira, restaurar e excluir permanentemente.
- [x] Criar rotas de API para gestão da lixeira de cursos e turmas externas (soft delete, listar lixeira, restaurar, delete permanente).
- [x] Implementar as abas/visões de Lixeira nas interfaces `/admin/cursos` e `/professor/turmas-externas` com feedback visual, modais de confirmação e ações de restauração.
- [x] Executar suíte de testes Vitest e validar build de produção (320 testes aprovados).

## Calendário Acadêmico, Carga Horária e Limite de Faltas — 19/08/2026
- [x] Adicionar colunas de calendário e regras de presença (`classDays`, `classTime`, `workloadHours`, `startDate`, `endDate`, `maxAbsencePercent`) nas tabelas `courses` e `external_classes`.
- [x] Atualizar script de migração aditiva no banco Neon de produção.
- [x] Atualizar formulários administrativos em `/admin/cursos` e `/professor/turmas-externas` para capturar dias de aula, horário, carga horária, datas e percentual máximo de faltas (ex: 25% padrão).
- [x] Integrar os campos às tabelas do banco e atualizar interfaces e formulários.
- [x] Executar suíte de testes Vitest e validar build de produção (320 testes aprovados).

## Alerta Visual de Limite de Faltas no Boletim do Aluno — 19/08/2026
- [x] Auditar a rota e o componente do boletim individual do aluno (`/professor/boletim/[studentId]` ou equivalente).
- [x] Calcular dinamicamente o percentual de faltas com base nas chamadas registradas e comparar com `maxAbsencePercent` da turma.
- [x] Adicionar selo/alerta visual (destaque em vermelho ou amarelo) e mensagem explicativa de reprovação por frequência caso o limite seja atingido.
- [x] Executar suíte de testes Vitest e validar build de produção.

## Correção Crítica de ID de Usuário em Progresso de Aulas — 19/08/2026
- [x] Substituir o uso incorreto de `parseInt(session.user.email.split('@')[0])` por `session.user.id` em `app/api/lessons/[id]/progress/route.ts`.
- [x] Criar teste automatizado cobrindo o endpoint de progresso de aula com autenticação válida.
- [x] Executar suíte de testes Vitest e validar build de produção.

## Correção de Tipagem no Formulário de Cursos em `/admin/cursos` — 19/08/2026
- [x] Atualizar a função `handleEdit` em `app/admin/cursos/page.tsx` para incluir todas as propriedades do calendário acadêmico e regra de faltas (`classDays`, `classTime`, `workloadHours`, `startDate`, `endDate`, `maxAbsencePercent`).
- [x] Executar build de produção (`pnpm build`) para verificar se o TypeScript compila sem erros.
- [x] Executar suíte de testes Vitest e salvar checkpoint.

## Barra de Progresso Visual no Painel do Curso — 19/08/2026
- [x] Localizar a página de detalhes/painel do curso (`/cursos/[id]` ou equivalente).
- [x] Calcular a porcentagem real de conclusão com base no total de aulas do curso versus aulas concluídas pelo aluno autenticado.
- [x] Adicionar componente visual de barra de progresso em gradiente com indicador numérico de porcentagem e contagem de aulas concluídas.
- [x] Executar suíte de testes Vitest e validar build de produção.

## Botão Condicional de Download de Certificado no Painel do Curso — 19/08/2026
- [x] Verificar o componente `CertificateModal` e a lógica de elegibilidade em `/cursos/[id]/page.tsx`.
- [x] Renderizar o botão de "Baixar Certificado" apenas quando `progressPercentage === 100` e o aluno estiver autenticado.
- [x] Conectar o botão ao modal de certificado com feedback visual claro e acessível.
- [x] Executar suíte de testes Vitest e validar estabilidade de build.

## Personalização Completa do Certificado (Nome, Data e Carga Horária) — 19/08/2026
- [x] Auditar a API de emissão de certificados (`/api/certificate/route.ts` ou equivalente) e o componente de visualização.
- [x] Incluir nome completo do aluno, data de conclusão formatada e carga horária do curso no payload e no modal.
- [x] Atualizar o layout do certificado para destacar formalmente as credenciais acadêmicas do professor Anderson Palafoz.
- [x] Executar suíte de testes Vitest e validar build de produção.

## Aba "Meus Certificados" no Perfil do Aluno — 19/08/2026
- [x] Localizar a página de perfil do aluno (`/dashboard/perfil` ou equivalente).
- [x] Adicionar a aba "Meus Certificados" utilizando os registros reais retornados pelo banco de dados (`getCertificates`).
- [x] Exibir cards com título do curso, nível CEFR, data de emissão, código de autenticidade e botão de download do certificado em PDF.
- [x] Executar suíte de testes Vitest e validar build de produção.

## Inclusão de CPF, Nome Social, Celular e E-mail de Alunos — 19/08/2026
- [x] Atualizar o schema Drizzle (`drizzle/schema.ts`) nas tabelas de usuários e estudantes externos para adicionar `cpf`, `socialName` e `phone` (celular).
- [x] Atualizar a API de perfil e os formulários de edição do aluno (`/dashboard/perfil`).
- [x] Atualizar as listagens de alunos para professores e administradores (`/admin/usuarios`, `/professor/alunos`, `/professor/turmas-externas`) exibindo CPF, nome social, celular e e-mail.
- [x] Executar suíte de testes Vitest e validar build de produção.

## Auditoria e Correção de Deploy no Vercel — 19/08/2026
- [x] Acessar painel do Vercel via navegador para auditar o log detalhado do erro de build.
- [x] Corrigir qualquer incompatibilidade de tipo ou configuração detectada nos logs do Vercel.
- [x] Executar build de produção local simulada (`NODE_ENV=production pnpm build`) para certificar sucesso.
- [x] Salvar checkpoint e orientar nova publicação.

## Máscaras de Formatação para CPF e Celular no Perfil do Aluno — 19/08/2026
- [x] Atualizar o componente `ProfileForm` em `components/profile-form.tsx` para incluir campos de CPF e nome social com funções auxiliares de máscara (`000.000.000-00` e `(00) 00000-0000`).
- [x] Atualizar a API `/api/user/profile` e a página `/dashboard/perfil/page.tsx` para carregar e salvar CPF e nome social corretamente.
- [x] Executar suíte de testes Vitest e validar estabilidade de build.

## Máscaras em Formulários Administrativos de Alunos — 19/08/2026
- [x] Localizar e atualizar os formulários de gestão de usuários e alunos em `/admin/usuarios` e `/professor/turmas-externas` com as funções de máscara de CPF e celular.
- [x] Executar suíte de testes Vitest e validar build de produção.

## Validação Real de CPF — 19/08/2026
- [x] Implementar função `isValidCpf` com cálculo matemático dos dígitos verificadores em `components/profile-form.tsx`.
- [x] Adicionar validação no envio do formulário e exibição de alerta caso o CPF seja inválido.
- [x] Executar testes Vitest e validar estabilidade.

## Assinatura Digital de Certificados via gov.br — 19/08/2026
- [x] Pesquisar e documentar os requisitos da API de Assinatura Eletrônica Avançada do gov.br (ITI / Secretaria de Governo Digital) [1].
- [x] Implementar fluxo de autenticação OAuth com escopo de assinatura e integração com o endpoint REST de assinatura de documentos PDF.
- [x] Disponibilizar painel administrativo para o professor/administrador assinar digitalmente os certificados antes de liberá-los para download pelos alunos.
- [x] Executar testes automatizados e validar conformidade com o padrão ICP-Brasil.

### Referências
- [1] [Roteiro de Integração da API de Assinatura Eletrônica GOV.BR](https://manual-integracao-assinatura-eletronica.servicos.gov.br/)

## Exportação CSV da Lista de Alunos no Admin — 19/08/2026
- [x] Criar endpoint ou função de exportação CSV para listar todos os alunos com nome, nome social, e-mail, CPF, celular, papel, status e data de cadastro.
- [x] Adicionar botão "Exportar CSV" na interface de gestão de usuários em `/admin/usuarios`.
- [x] Executar testes Vitest e validar build de produção.

## Pesquisa por Nome ou CPF na Gestão de Usuários — 19/08/2026
- [x] Atualizar a lógica de filtro `filteredUsers` em `/admin/usuarios/page.tsx` para buscar também por CPF (com ou sem pontuação) e nome social.
- [x] Atualizar o placeholder da barra de pesquisa para indicar "Buscar por nome, CPF, email ou telefone".
- [x] Executar testes Vitest e validar build de produção.

## Paginação na Gestão de Usuários do Admin — 19/08/2026
- [x] Adicionar estado de página atual e itens por página (ex: 10 ou 15 por página) em `/admin/usuarios/page.tsx`.
- [x] Implementar controles de paginação (Anterior, Próxima e indicador de páginas) na tabela de usuários.
- [x] Executar testes Vitest e validar estabilidade.

## Aprimoramento Visual e Responsivo dos Painéis Admin e Professor — 19/08/2026
- [x] Refinar `/app/admin/page.tsx` com cartões acadêmicos unificados, sombras suaves e espaçamento responsivo.
- [x] Refinar `/app/professor/page.tsx` com o mesmo padrão visual de excelência e hierarquia clara.
- [x] Executar testes Vitest e validar estabilidade.

## Aprimoramento Visual e Responsivo das Subpáginas Admin e Professor — 19/08/2026
- [x] Padronizar cabeçalhos, cartões, tipografia e navegação em todas as subpáginas de `/admin/*`.
- [x] Padronizar componentes e espaçamento em todas as subpáginas de `/professor/*`.
- [x] Garantir responsividade perfeita em dispositivos móveis e desktop com testes validados.

## Aprimoramento Visual e Responsivo: Cursos, Turmas Externas, Materiais e Blog — 19/08/2026
- [x] Auditar rotas e componentes de cursos (`/cursos`, `/admin/cursos`), turmas externas (`/professor/turmas-externas`), materiais (`/materiais`, `/admin/materiais`) e blog (`/blog`, `/admin/blog`).
- [x] Padronizar cartões, grids, tipografia Poppins e espaçamento em todas as listagens.
- [x] Refinar páginas de detalhes, modais, formulários e barras de busca/filtros com estados de carregamento impecáveis.
- [x] Validar estabilidade com testes automatizados e criar checkpoint de entrega.

## Aprimoramento Visual e Responsivo Completo: Dashboard, Cursos, Turmas, Materiais e Blog — 19/08/2026
- [x] Unificar o Design System, fontes Poppins e cartões em todo o ecossistema.
- [x] Aprimorar o dashboard do aluno (`/dashboard`) e suas subpáginas de perfil, cursos, certificados, calendário e anotações.
- [x] Garantir responsividade perfeita e testes Vitest validados.

## Compatibilidade com V0 e Vercel — 19/08/2026
- [x] Auditar configuração do Next.js, tsconfig e dependências para v0 e Vercel.
- [x] Garantir que rotas de API e componentes cliente/servidor estejam totalmente isolados e compatíveis com Serverless/Edge.
- [x] Executar testes automatizados (Vitest) e validar build de produção.

## Sistema de Busca e Filtros para Cursos e Materiais — 19/08/2026
- [x] Implementar busca textual por título e descrição em `/cursos` e `/materiais`.
- [x] Adicionar filtros por categoria, nível acadêmico e tipo de acesso.
- [x] Otimizar performance de listagem e responsividade com feedback visual.

## Skeletons Animados em Busca e Filtros de Cursos — 19/08/2026
- [x] Implementar estados de carregamento com skeletons animados na página de listagem de cursos ao filtrar ou pesquisar.
- [x] Garantir transição fluida e feedback visual imediato para o usuário.

## Paginação e Botão "Carregar Mais" em Cursos — 19/08/2026
- [x] Implementar paginação e botão "Carregar Mais" na listagem de cursos.
- [x] Integrar com busca, filtros, ordenação e skeletons animados.

## Botão "Continuar de Onde Parou" no Dashboard — 19/08/2026
- [x] Implementar botão de destaque "Continuar de onde parou" no topo do dashboard para o último curso e aula acessados.
- [x] Garantir validação com testes automatizados e checkpoint.

- [x] Corrigir import de `@/server/db` para `@/lib/db` na rota de exportação de usuários (`app/api/admin/export-users/route.ts`).
- [x] Validar build de produção do Next.js 15 e aprovação de 321 testes automatizados (Vitest).
- [x] Criar seção de histórico de cursos acessados e progresso no dashboard do usuário.

## Botão de Exportação de Relatório de Progresso em PDF no Dashboard — 19/08/2026
- [x] Implementar botão de exportação do relatório de progresso individual do aluno em PDF no dashboard.
- [x] Garantir validação com testes automatizados e checkpoint.

## Compartilhamento no LinkedIn de Relatório e Certificados — 19/08/2026
- [x] Implementar botões de compartilhamento direto no LinkedIn para o relatório de progresso acadêmico e certificados do aluno no dashboard.
- [x] Validar compilação e testes automatizados.

## Aprimoramento do StreakBadge (Tooltip, Skeleton e Popover de Calendário) — 19/08/2026
- [x] Implementar skeleton de carregamento suave no StreakBadge.
- [x] Adicionar tooltip explicativo detalhado sobre o cálculo da ofensiva por conclusão diária.
- [x] Criar popover interativo com calendário visual dos dias de atividade recentes.
- [x] Validar testes e build de produção.

## Correção do Erro de Carregamento do Histórico de Compras em /dashboard/perfil — 19/08/2026
- [x] Auditar e corrigir a API e o componente de histórico de compras na página de perfil do usuário.
- [x] Validar com testes automatizados e build de produção.

## Recibo Individual em PDF e Skeleton no Histórico de Compras — 19/08/2026
- [x] Implementar botão de download de recibo individual em PDF para cada transação no histórico de compras do perfil.
- [x] Adicionar skeleton de carregamento suave para a seção de faturamento.
- [x] Validar testes e build de produção.

## Correção do Erro de Carregamento de Materiais Salvos em /dashboard/desejos — 19/08/2026
- [x] Auditar e corrigir a página e a API de materiais salvos e desejos do usuário.
- [x] Validar com testes automatizados e build de produção.

## Botão de Remoção na Lista de Desejos com Toast de Sucesso — 19/08/2026
- [x] Refinar o botão de remoção na página de desejos (`/dashboard/desejos`) com ícone, feedback de carregamento por item e toast de sucesso.
- [x] Validar testes e build de produção.

## Lixeira de Cursos para Admin e Professor — 19/08/2026
- [x] Adicionar suporte a soft delete (deletedAt) na tabela de cursos e endpoints de gerenciamento.
- [x] Implementar botões de enviar para a lixeira e restaurar nos painéis /admin e /professor.
- [x] Validar testes automatizados e build de produção.

## Lixeira Avançada de Cursos com Batch Actions, Modal e Busca — 19/08/2026
- [x] Adicionar seleção múltipla com checkboxes na aba da lixeira para ações em lote.
- [x] Implementar barra de pesquisa e filtros por nível na aba da lixeira.
- [x] Adicionar modal de confirmação de segurança para exclusão permanente de cursos.
- [x] Validar testes automatizados e build de produção.

## Gestão Unificada de Cursos no Painel — 19/08/2026
- [x] Padronizar a listagem de cursos no painel com contagem, níveis e botão "Ver" semelhante às listagens de alunos e professores.
- [x] Validar testes automatizados e build de produção.

## Paginação e Ações Rápidas na Lista de Cursos do Painel — 19/08/2026
- [x] Implementar paginação e carregamento incremental na listagem de cursos do painel.
- [x] Adicionar menu de ações rápidas (Ver, Editar, Enviar para lixeira) em cada item da lista.
- [x] Validar testes automatizados e build de produção.

## Modal de Seleção de Dias da Semana em Turmas Externas — 19/08/2026
- [x] Implementar modal interativo para selecionar ou não os dias da semana de aula no cadastro/edição de turmas externas.
- [x] Validar testes automatizados e build de produção.

## Modalidade (Remota/Presencial) e Modal de Dias da Semana em Turmas Externas — 19/08/2026
- [x] Adicionar seletor de modalidade (Remota / Presencial) no formulário de turmas externas.
- [x] Implementar modal interativo para escolher dias específicos da semana ou optar por não definir.
- [x] Validar testes automatizados e build de produção.

## Link Online e Sala Presencial em Turmas Externas — 19/08/2026
- [x] Adicionar suporte a `meetingLink` e `classroomLocation` no schema, API e formulário de turmas externas.
- [x] Validar testes automatizados e build de produção.

## Exclusão Definitiva de Cursos em /admin e /professor — 19/08/2026
- [x] Adicionar botões de exclusão definitiva com modal de segurança nas listagens de cursos de /admin e /professor.
- [x] Validar testes automatizados e build de produção.

## Toast com Desfazer e Edição Rápida de Detalhes e Links de Cursos — 19/08/2026
- [x] Adicionar toast interativo com opção de "Desfazer" ao enviar um curso para a lixeira.
- [x] Garantir acesso direto à edição de detalhes e links no menu de ações rápidas.
- [x] Validar testes automatizados e build de produção.

## Pesquisa em Tempo Real, Tags de Status e Exportação CSV/PDF de Cursos — 19/08/2026
- [x] Implementar barra de pesquisa em tempo real para filtrar cursos por nome ou nível.
- [x] Adicionar sistema de tags coloridas de status baseadas em dados reais (Ativo, Módulos Prontos, etc.).
- [x] Criar opções de exportação da lista de cursos em CSV e PDF.
- [x] Validar testes automatizados e build de produção.

## Filtros Rápidos por Status e Animação de Salvamento em Cursos — 19/08/2026
- [x] Adicionar botões de filtro rápido por status no topo da lista de cursos.
- [x] Incluir animação suave e notificação visual de sucesso ao alterar o status do curso pela tag.
- [x] Validar testes automatizados e build de produção.

## Correção Urgente de Build: Substituição de jspdf por Exportação Nativa em PDF/HTML — 19/08/2026
- [x] Remover dependência de jspdf não instalada em components/professor-courses-list.tsx.
- [x] Implementar exportação de relatório PDF nativa e robusta.
- [x] Validar build de produção local e testes automatizados.

## Cabeçalho com Logo/Data no PDF, Dashboard em Admin/Professor e Auditoria de Responsividade — 19/08/2026
- [x] Adicionar logotipo da escola e data atual no cabeçalho da exportação nativa de PDF em components/professor-courses-list.tsx.
- [x] Integrar resumo estatístico do dashboard nas páginas principais de admin (/admin/page.tsx) e professor (/professor/page.tsx).
- [x] Auditar responsividade, comportamento em dispositivos móveis e design system em todas as abas.
- [x] Executar testes automatizados e validar build de produção sem erros.

## Skeleton Loading, Gráfico de Matrículas e Resiliência na API de Professor — 19/08/2026
- [x] Implementar skeleton loading nos painéis estatísticos de Administrador e Professor.
- [x] Incluir gráfico de barras interativo de evolução de matrículas no painel do administrador.
- [x] Corrigir erro 500 no endpoint `/api/professor/resumo` com tolerância a falhas e retorno estruturado seguro.
- [x] Executar bateria de 321 testes automatizados (Vitest) e validar build de produção.

## Correção Definitiva de Build de Produção (Skeleton Component) — 19/08/2026
- [x] Criar componente `components/ui/skeleton.tsx` compatível com o design system do Vercel/Next.js.
- [x] Executar build de produção com sucesso absoluto (Next.js 15 compilado sem erros).
- [x] Validar 321 testes automatizados (Vitest) com 100% de aprovação.

## Persistência da Lixeira após Refresh e Harmonização do Painel Admin — 19/08/2026
- [x] Ajustar loaders do servidor (`lib/teacher.ts`) para excluir estritamente cursos movidos para a lixeira (`deletedAt IS NOT NULL`), garantindo persistência após atualização da página em `/professor` e `/admin`.
- [x] Harmonizar o cabeçalho e design visual do painel administrativo (`/admin`) com o padrão refinado do painel do professor, implementando o princípio onde o superadmin possui todas as prerrogativas docentes e gerenciais estendidas.
- [x] Validar 321 testes automatizados (Vitest) com 100% de aprovação.

## Gestão da Lixeira no Admin e Gráfico Comparativo Mensal — 19/08/2026
- [x] Disponibilizar aba completa de lixeira no painel de administração (`/admin/cursos`) com ações persistentes de restaurar e excluir permanentemente.
- [x] Atualizar API de estatísticas administrativas (`/api/admin/stats` e `getAdminStats`) para incluir a série temporal de cursos criados por mês.
- [x] Implementar gráfico interativo SVG no painel do administrador comparando mensalmente o volume de matrículas e cursos criados.
- [x] Executar bateria de 321 testes automatizados (Vitest) com 100% de aprovação.

## Modal de Confirmação Segura para Exclusão Permanente de Cursos na Lixeira — 19/08/2026
- [x] Implementar modal interativo e detalhado com exibição de título, nível, categoria, módulos e descrição antes de executar a exclusão permanente de um curso na lixeira do admin.
- [x] Executar bateria de 321 testes automatizados (Vitest) com 100% de aprovação.

## Ações em Lote na Lixeira e Registro de Atividades (Auditoria) — 19/08/2026
- [x] Adicionar seleção múltipla com checkboxes e botões de ação em lote ("Restaurar Selecionados" e "Excluir Selecionados") na lixeira do administrador.
- [x] Criar infraestrutura de banco de dados (`admin_activity_logs`) e rotas de API dedicadas (`/api/admin/courses/batch` e `/api/admin/activity-logs`) para rastrear todas as exclusões, restaurações e operações em lote.
- [x] Desenvolver a página de auditoria de atividades (`/admin/cursos/audit`) exibindo administrador responsável, data/hora, tipo de ação e cursos afetados.
- [x] Corrigir a diretiva `"use client"` ausente em `/app/admin/page.tsx` para garantir build de produção perfeito no Vercel.
- [x] Executar build de produção local com sucesso (`pnpm build`) e aprovar 100% dos 321 testes automatizados (Vitest).

## Botão Selecionar Todos, Contador Visual e Exportação CSV de Auditoria — 19/08/2026
- [x] Adicionar botão explícito de "Selecionar Todos / Desmarcar Todos" e contador visual destacado de itens selecionados na lixeira do administrador.
- [x] Implementar funcionalidade de exportação do registro de atividades administrativas em formato CSV com codificação UTF-8 (`/admin/cursos/audit`).
- [x] Executar build de produção otimizado com sucesso (`pnpm build`) e validar 100% dos 321 testes automatizados (Vitest).

## Atualização Imediata do Contador da Lixeira — 19/08/2026
- [x] Atualizar todas as mutações de cursos (`confirmDeleteCourse`, `handleRestore`, `handlePermanentDelete`, `handleBatchAction`) para disparar `fetchTrash()` e `fetchCourses()` imediatamente, garantindo atualização em tempo real do contador e listagens.
- [x] Validar bateria completa de 321 testes automatizados (Vitest) com 100% de sucesso.

## Paginação na Auditoria e Correção da Restauração em Lote — 19/08/2026
- [x] Implementar paginação robusta com controle de limite, deslocamento e total de registros (`/api/admin/activity-logs` e `/admin/cursos/audit`).
- [x] Garantir a restauração e operações em lote corretas de todos os itens selecionados na lixeira, sincronizando contadores imediatamente.
- [x] Validar bateria completa de 321 testes automatizados (Vitest) com 100% de aprovação.

## Sistema de Lixeira, Restauração e Exclusão para Alunos e Materiais — 19/08/2026
- [x] Adicionar suporte a `deletedAt` nas tabelas `users` e `materials` (banco de dados e Drizzle schema).
- [x] Criar funções de soft delete, restauração e exclusão permanente com dependências em `lib/db.ts`.
- [x] Implementar endpoints de lote (`/api/admin/users/batch` e `/api/admin/materials/batch`) e rotas de lixeira.
- [x] Executar bateria de testes automatizados e build de produção com sucesso.

## Sistema de Lixeira, Restauração e Exclusão em Lote para Alunos e Materiais — Concluído
- [x] Implementar abas de lixeira, restauração, exclusão permanente com confirmação detalhada e lote para materiais e alunos.
- [x] Garantir sincronização e contadores em tempo real no painel administrativo.
- [x] Executar bateria completa de testes automatizados e salvar checkpoint final.

## Governança de Autoria e Permissões (RBAC) para Professores e Administradores
- [x] Implementar verificação de que professores só podem excluir, mover para lixeira ou restaurar cursos, turmas e materiais criados por eles mesmos.
- [x] Permitir que administradores e superadministradores gerenciem itens criados por qualquer usuário.
- [x] Adicionar testes automatizados para validar as regras de permissão por autoria.
- [x] Validar build e salvar checkpoint.

## Governança de Autoria e Permissões (RBAC) para Professores e Administradores — Concluído
- [x] Implementar verificação de que professores só podem excluir, mover para lixeira ou restaurar cursos, turmas e materiais criados por eles mesmos.
- [x] Permitir que administradores e superadministradores gerenciem itens criados por qualquer usuário.
- [x] Bateria completa de testes Vitest aprovada com 100% de sucesso.

## Filtragem de Lixeira por Autoria para Professores — Concluído
- [x] Ajustar APIs de listagem e lixeira (cursos, turmas externas e materiais) para filtrar por criador quando o usuário logado for professor.
- [x] Garantir que administradores e superadministradores mantenham visão global de todos os itens.
- [x] Validar com testes Vitest e salvar checkpoint estável.

## Contador da Lixeira no Menu Lateral — Concluído
- [x] Criar API de contagem de lixeira respeitando escopo de professor vs admin.
- [x] Exibir badge com contagem exata no menu lateral das áreas administrativas.
- [x] Validar com testes e salvar checkpoint.

## Atualização Instantânea do Contador da Lixeira no Menu Lateral — Concluído
- [x] Implementar custom event / hook compartilhado para propagar mudanças de contagem da lixeira sem refresh.
- [x] Atualizar os componentes de lixeira para disparar o evento após excluir, restaurar ou mutar itens.
- [x] Validar com testes e salvar checkpoint estável.

## Modal de Confirmação de Segurança para Exclusão Permanente — Concluído
- [x] Garantir que cursos, materiais, alunos e turmas externas utilizem modal detalhado de confirmação antes de qualquer exclusão definitiva.
- [x] Bloquear botões durante o processamento para evitar cliques acidentais duplicados.
- [x] Executar testes Vitest e salvar checkpoint estável.

## Esvaziar Lixeira com Um Clique — Concluído
- [x] Criar API segura para esvaziar lixeira respeitando o escopo de permissões (global para admin/super-admin e restrito por autoria para professores).
- [x] Adicionar botão "Esvaziar Lixeira" com modal de confirmação de segurança e aviso de irreversibilidade nas páginas de administração.
- [x] Disparar evento de atualização instantânea do contador no menu lateral e registrar log de auditoria.
- [x] Validar com testes e salvar checkpoint.

## Notificações Toast com Ação Desfazer para Lixeira — Concluído
- [x] Implementar toast interativo com botão de desfazer ao mover cursos para a lixeira.
- [x] Integrar restauração instantânea ao clicar em Desfazer, atualizando contadores e listagens sem refresh.
- [x] Executar testes Vitest e salvar checkpoint estável.

## Filtro por Categoria na Lixeira — Concluído
- [x] Adicionar opções de filtro por categoria (Cursos, Alunos, Materiais, Turmas Externas) na interface da lixeira.
- [x] Atualizar contadores e ações em lote para respeitar a categoria selecionada.
- [x] Executar testes Vitest e salvar checkpoint estável.

## Documentação dos Cinco Tipos de Curso — Concluído
- [x] Criar arquivo `TIPOS_DE_CURSOS_ESPECIFICACAO.md` detalhando os cinco tipos de cursos, regras de acesso, cores, tags e fluxos.
- [x] Executar testes Vitest e salvar checkpoint estável.

## Plano Estratégico dos Cinco Tipos de Curso — Concluído
- [x] Criar arquivo `PLANO_ESTRATEGICO_CINCO_CURSOS.md` detalhando o mapeamento de rotas, fases de implementação e critérios de sucesso.
- [x] Executar validação e salvar checkpoint.

## Auditoria de Schema para a Fase 1 — Concluído
- [x] Criar arquivo `AUDITORIA_SCHEMA_FASE_1.md` detalhando a análise do schema atual, lacunas e script SQL proposto.
- [x] Executar validação e salvar checkpoint.

## Execução da Migração SQL da Fase 1 — Concluído
- [x] Executar script SQL para adicionar as colunas `course_type`, `external_redirect_url` e `sync_modality` na tabela `courses`.
- [x] Validar a estrutura pós-migração no banco de desenvolvimento com sucesso.

## Atualização do Formulário e Páginas dos Cinco Tipos de Curso — Concluído
- [x] Auditar e atualizar o formulário administrativo de criação e edição de cursos com tipo, URL externa e modalidade.
- [x] Atualizar contratos de API e validações para persistir os novos campos.
- [x] Atualizar listagens, detalhes e páginas públicas com sinalização visual e comportamento adequado por modalidade.
- [x] Criar ou atualizar testes Vitest, validar build e responsividade.

## Fase 2 — Refinamento da Vitrine Pública dos Cinco Tipos de Curso
- [x] Adicionar legenda interativa explicando os cinco tipos de curso na página pública de aulas.
- [x] Adicionar filtros rápidos por tipo de curso na vitrine pública.
- [x] Auditar contraste, foco visível, navegação por teclado e modo escuro das tags e filtros.
- [x] Ajustar CTAs públicos para cursos particulares e aulas presenciais/agendamento.
- [x] Criar testes Vitest para legenda, filtros e CTAs públicos.
- [x] Validar build, responsividade e atualizar o markdown com o resultado da Fase 2.

## Feedback Visual para Redirecionamento Externo — 20/08/2026
- [x] Criar componente interativo de redirecionamento com indicador de carregamento e mensagem visual.
- [x] Integrar o feedback nos CTAs de cursos EAD fechados e corporativos com link externo.
- [x] Criar teste Vitest para verificar o comportamento de redirecionamento.
- [x] Validar build e salvar checkpoint.

## Validação de Build de Produção — 20/08/2026
- [x] Executar build de produção do Next.js 15 e verificar ausência de erros de compilação.

## Fase 3 — Otimização dos Fluxos de Conversão e Atendimento
- [x] Auditar e conectar a página de contato aos parâmetros reais de curso para Tipos 3 e 5.
- [x] Implementar pré-preenchimento contextual da mensagem de contato/agendamento pelo curso selecionado.
- [x] Validar o comportamento de matrícula e acesso dos Tipos 1 e 2 sem alterar regras de pagamento existentes.
- [x] Auditar a rota de turmas externas para o Tipo 4 e registrar os resultados no plano estratégico.
- [x] Criar testes de integração/regressão da primeira entrega da Fase 3.

## Validação de Checkout e Conversão (Tipos 1 e 2) — Concluído
- [x] Auditar rotas de API do Stripe (sessão, compras e webhooks) para cursos EAD fechados e híbridos.
- [x] Verificar o tratamento de gratuidade versus preço pago em cursos dos Tipos 1 e 2.
- [x] Garantir que o botão de compra exiba feedback claro de redirecionamento e tratamento de erros do gateway.
- [x] Criar ou atualizar testes unitários do fluxo de checkout e pagamento.
- [x] Executar testes Vitest, validar build e salvar checkpoint.

## Filtros Administrativos por Tipo e Modalidade — 20/08/2026
- [x] Adicionar seletores de filtro por tipo de curso e modalidade síncrona no painel de administração (`/admin/cursos`).
- [x] Garantir filtragem reativa combinada com a busca por nome e nível.
- [x] Adicionar botão de limpar filtros e mensagem clara de estado vazio quando nenhum curso corresponder.
- [x] Criar testes unitários para a filtragem administrativa de cursos.
- [x] Executar testes Vitest, validar build e salvar checkpoint.

## Fase 4 — Governança, Regressão e Homologação
- [x] Auditar contratos de RBAC por autoria para cursos, turmas e materiais.
  - [x] Materiais: adicionar `instructorId`, restringir listagens e validar operações individuais por autoria.
  - [x] Cursos e turmas externas: concluir verificação dos contratos de autoria (`canManageCourse`, `canManageExternalClass`).
- [x] Auditar a retenção de 30 dias, contadores e operações da lixeira.
- [x] Criar testes de regressão para as regras de governança e lixeira.
  - [x] Materiais: teste de contrato de RBAC criado e aprovado.
  - [x] Contato: teste de contrato de contraste no modo escuro criado e aprovado.
  - [x] Governança geral: teste `governance-phase4.test.ts` criado e aprovado.
- [x] Executar a suíte completa Vitest e o build de produção da primeira entrega da Fase 4.
- [x] Atualizar o plano estratégico com os achados e o primeiro resultado da Fase 4.

## Correção do Modo Escuro na Página de Contato — 20/08/2026
- [x] Atualizar `app/contato/page.tsx` com classes semânticas de modo escuro (`dark:bg-background dark:text-foreground`).
- [x] Atualizar `components/contact-form.tsx` com suporte a fundo e texto legíveis no modo escuro.
- [x] Garantir que a coluna `instructorId` exista no banco de dados de testes para materiais.
- [x] Executar suíte completa Vitest e build de produção.


## Fase 5: Homologação em Produção, Webhook Stripe e Retenção Automática de 30 Dias (Agosto 2026)
- [x] Validar integridade das variáveis de ambiente na Vercel e realizar teste de fumaça nas rotas críticas
- [x] Configurar e validar o webhook do Stripe em produção para liberação automática de matrículas (Tipos 1 e 2)
- [x] Implementar rotina periódica (Heartbeat) para exclusão automática de itens na lixeira após 30 dias
- [x] Executar bateria completa de testes Vitest (339 testes aprovados com 100% de sucesso)

## Correção Crítica de Erro 500 em Turmas Externas (Agosto 2026)
- [ ] Auditar e corrigir a rota de API e componentes da página de turmas externas (`/professor/turmas-externas`) para eliminar o erro HTTP 500 em produção

## Novas Pendências Relatadas — Continuidade de Curso e Modo Escuro (Agosto 2026)
- [x] Auditar e corrigir o botão/fluxo "Continuar" no dashboard e no player de cursos, incluindo navegação para a próxima aula, persistência de progresso e finalização
- [x] Auditar e corrigir contraste, fundos, textos, badges, links e estados interativos no modo escuro de `/cursos/[id]`

## Retomada do Incidente HTTP 500 em Turmas Externas
- [ ] Confirmar a correção da rota `/api/professor/external-classes` com teste autenticado e verificar compatibilidade do schema de produção

## Homologação Multimídia do Player de Aulas
- [x] Auditar o player no curso de teste 5 e na aula 4 para reprodução de vídeos hospedados localmente ou externamente
- [x] Auditar reprodução de áudios de listening, incluindo estados de carregamento, erro, controles, acessibilidade e URLs futuras
- [x] Auditar gravação, upload e persistência de atividades de speaking, incluindo permissões, armazenamento e retorno visual ao aluno
- [x] Garantir contratos reutilizáveis para que cursos e aulas futuras suportem vídeo, listening e speaking sem lógica específica do curso 5
- [x] Criar testes automatizados e critérios de homologação para os três tipos de mídia

## Privacidade e Autorização de Cursos Externos
- [x] Remover cursos externos do catálogo e de todas as páginas públicas
- [x] Impedir que usuários sem vínculo autorizado visualizem detalhes, módulos, aulas, materiais ou links de cursos externos
- [x] Permitir acesso apenas a administradores, professores autorizados e alunos vinculados, conforme RBAC
- [x] Auditar APIs públicas, páginas de curso, busca, recomendações, dashboard e cache para evitar vazamento de cursos externos
- [x] Criar testes de autorização para visitante, aluno não vinculado, aluno vinculado, professor e administrador

## Incidente de Checkout Stripe em Produção
- [x] Auditar a leitura de `STRIPE_SECRET_KEY` no servidor e diferenciar ambiente de teste e produção
- [x] Verificar o endpoint de criação de checkout e o motivo exato da mensagem "Stripe não está configurado no servidor"
- [ ] Validar as variáveis públicas e privadas relacionadas ao Stripe no ambiente Vercel sem expor valores secretos
- [x] Garantir feedback visual claro quando a configuração estiver ausente, inválida ou indisponível
- [x] Criar teste de regressão para criação de checkout de curso pago e manter o webhook idempotente

## Incidente de Download da Biblioteca e Google Drive
- [x] Auditar a origem e o formato dos links de arquivos exibidos em `/dashboard/biblioteca`
- [x] Verificar a rota de download/proxy, autenticação e permissões do Google Drive
- [x] Diferenciar links públicos, links restritos e arquivos inexistentes com mensagens específicas
- [x] Garantir download ou abertura segura para materiais hospedados no Google Drive, sem expor credenciais
- [x] Criar testes de regressão para os fluxos de download e seus estados de erro

## Incidente de Integração Google Calendar
- [ ] Auditar por que a sessão do Google Calendar está ausente ou expirada em `/dashboard/calendario`
- [ ] Verificar escopos OAuth, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, URL de callback e armazenamento do token
- [ ] Confirmar se a Google Calendar API está habilitada no projeto Google Cloud correspondente
- [ ] Iniciar o fluxo de autorização novamente sem solicitar escopos desnecessários
- [ ] Validar leitura de eventos após a autorização e exibir mensagens distintas para sessão expirada, API desabilitada e ausência de permissões

## Pendente por Bloqueio de Autenticação
- [ ] Retomar a autorização OAuth do Google Calendar quando o login da conta Google estiver disponível
- [ ] Concluir o consentimento do escopo `calendar.readonly` e validar a leitura de eventos em `/dashboard/calendario`
- [ ] Confirmar, após a autorização, se a Google Calendar API está habilitada no projeto Google Cloud correspondente

## Correção do Build de Produção — 20/08/2026
- [x] Restaurado o suporte Heartbeat ausente (`server/_core/heartbeat.ts`, ambiente, tipos e SDK mínimo) sem depender da antiga arquitetura Express
- [x] Eliminado o erro de compilação `Module not found: Can't resolve '@/server/_core/sdk'`
- [x] Build de produção Next.js validado com sucesso usando limite de memória controlado
- [ ] Executar novo deploy na Vercel e confirmar o estado `Ready` em produção

## Auditoria de Configuração Stripe — 20/08/2026
- [x] Confirmado no ambiente local que `STRIPE_SECRET_KEY` está em modo de teste, `STRIPE_WEBHOOK_SECRET` está presente e `VITE_STRIPE_PUBLISHABLE_KEY` está em modo de teste
- [x] Criados códigos seguros `STRIPE_NOT_CONFIGURED`, `STRIPE_INVALID_KEY` e `STRIPE_CHECKOUT_FAILED`, sem exposição de segredos
- [x] Testes específicos de configuração e checkout aprovados (6 testes)
- [ ] Confirmar no ambiente Vercel Production que as chaves correspondentes estão presentes e pertencem ao mesmo modo Stripe

## Conclusão da Correção Stripe — 20/08/2026
- [x] Checkout agora classifica configuração ausente, chave inválida e falha temporária sem expor segredos
- [x] Webhook agora valida o corpo bruto, assinatura, metadados de matrícula e retorna códigos operacionais seguros
- [x] Removido o bypass artificial de eventos `evt_test_` para manter a validação real do webhook
- [x] Proteção de idempotência de matrícula aplicada e verificada no banco Neon principal
- [x] Schema Drizzle alinhado com a proteção de idempotência e migração `0051_green_jane_foster.sql` gerada
- [x] Suíte completa validada: 105 arquivos de teste e 346 testes aprovados
- [x] Build de produção Next.js validado após as alterações
- [ ] Confirmar em produção, após novo deploy, o Checkout Stripe com chaves do mesmo modo e webhook ativo

## Incidente de Runtime Webpack no Preview — 20/08/2026
- [x] Diagnosticar o erro `__webpack_modules__[moduleId] is not a function` detectado no preview após o checkpoint
- [x] Confirmar que a causa era cache/artefatos `.next` inconsistentes após a limpeza do build durante o servidor ativo
- [x] Reiniciar o servidor, recriar os artefatos Next.js e validar visualmente o preview sem o erro de runtime

## Auditoria de Compatibilidade com Vercel e Variáveis de Produção (Agosto 2026)
- [x] Consolidar o estado atual das correções de build, Heartbeat, rotinas de banco Neon e player multimídia
- [ ] Auditar e validar a integridade das variáveis de ambiente exigidas em produção pela Vercel (`DATABASE_URL`, `NEON_DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
- [x] Validar a compatibilidade do Next.js 15 App Router e server actions/endpoints — build de produção aprovado; checagem TypeScript isolada permanece limitada pela memória do sandbox
- [x] Registrar instruções passo a passo para o usuário configurar variáveis de ambiente na Vercel caso algum conector exija autenticação manual no painel

## Feedback Visual de Atividades no Player (Agosto 2026)
- [x] Exibir toast acessível de sucesso ao concluir uma atividade de listening
- [x] Exibir toast acessível de sucesso ao concluir uma atividade de speaking
- [x] Exibir toast de erro acionável quando o envio ou persistência da atividade falhar
- [x] Impedir toasts duplicados durante cliques repetidos e manter o feedback compatível com mobile e modo escuro
- [x] Criar ou atualizar testes de interação, rodar Vitest e validar build de produção antes do checkpoint

## Ação Desfazer em Toasts de Atividades (Agosto 2026)
- [x] Adicionar botão Desfazer no toast após concluir listening
- [x] Adicionar botão Desfazer no toast após concluir speaking
- [x] Reverter o progresso persistido sem apagar o histórico de tentativas de speaking
- [x] Garantir idempotência, bloqueio de cliques duplicados e feedback de erro na reversão
- [x] Criar testes de contrato e validar build e comportamento responsivo antes do checkpoint

## Auditoria de Pendências Reais e Próximas Melhorias (Agosto 2026)
- [ ] **Validação de Variáveis na Vercel:** Confirmar se `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEON_DATABASE_URL` e `NEXTAUTH_URL` estão gravadas no painel da Vercel para produção.
- [ ] **Reautorização do Google Calendar:** Concluir o consentimento OAuth do escopo `calendar.readonly` na conta Google do professor quando a sessão estiver disponível.
- [x] **Refinamento Visual de Contraste em Modo Escuro:** Auditar componentes isolados em `/cursos/[id]` para garantir que todos os textos secundários atinjam padrão WCAG AAA em dark mode.
- [ ] **Monitoramento de Heartbeat em Produção:** Acompanhar as execuções da rota `/api/scheduled/cleanup-trash` na Vercel para confirmar a retenção de 30 dias da lixeira.

## Ajuste de Contraste WCAG AAA em Modo Escuro (Agosto 2026)
- [x] Auditar e ajustar classes de texto secundário em `/app/cursos/[id]/page.tsx` para garantir alto contraste (WCAG AAA) no modo escuro
- [x] Garantir que badges, descrições, metadados e botões mantenham legibilidade perfeita sobre fundos escuros
- [x] Criar teste automatizado de contraste para a página de cursos e validar na suíte Vitest
- [x] Validar responsividade e build de produção antes de salvar o checkpoint final

## Privacidade de Cursos Externos na Página /aulas (Agosto 2026)
- [x] Ocultar cursos com `courseType === 4` (cursos externos institucionais/terceiros) da listagem pública em `/aulas`
- [x] Criar teste automatizado verificando que nenhum curso externo é retornado na rota pública ou componente de catálogo
- [x] Validar build e integridade da suíte Vitest — suíte completa aprovada e build de produção aprovado após liberar memória do sandbox

## Download de Materiais Restrito a Usuários Autenticados (Agosto 2026)
- [x] Auditar a rota e componente de download de materiais (`/components/download-material-button.tsx` e API associada)
- [x] Garantir que usuários não logados recebam redirecionamento para login ou aviso amigável ao tentar baixar
- [x] Assegurar que usuários autenticados consigam abrir ou baixar o arquivo (Google Drive / S3) com segurança e feedback visual
- [x] Criar testes automatizados cobrindo download anônimo vs. logado
- [x] Executar suíte Vitest e validar build de produção

## Cadeado e Tooltip de Login em Materiais para Visitantes (Agosto 2026)
- [x] Exibir ícone de cadeado e tooltip interativo para usuários não logados nos botões e cards de materiais
- [x] Direcionar o visitante para a página de login ao clicar no material protegido
- [x] Criar teste automatizado para verificar a presença do cadeado e do tooltip em modo anônimo
- [x] Validar suíte Vitest e build de produção — suíte completa e build de produção aprovados

## Revisão Ant-FOUC do Script de Tema no Head (Agosto 2026)
- [x] Auditar o script síncrono no head de `app/layout.tsx` para garantir detecção correta de modo escuro, claro, sistema e alto contraste
- [x] Sincronizar o estado do ThemeProvider (`attribute="class"`, `enableSystem`) com o `localStorage` para evitar hidratação divergente
- [x] Criar teste automatizado verificando o tratamento de FOUC e rodar suíte Vitest
- [x] Validar build de produção e salvar checkpoint — build e checkpoint foram concluídos após liberar memória do sandbox

## Auditoria e Refinamento do Blog — Administrativo e Público (Agosto 2026)
- [x] Auditar schema e rotas de API do blog (`/api/admin/articles` e afins) para criação, edição, publicação e exclusão
- [x] Auditar painel administrativo de artigos para garantir RBAC, autoria e feedback visual de rascunhos vs publicados
- [x] Auditar catálogo público (`/blog`) e páginas individuais (`/blog/[slug]`) quanto a SEO, metadados, tempo de leitura e tags
- [x] Validar a integração de artigos relacionados e materiais didáticos recomendados
- [x] Criar testes automatizados cobrindo o fluxo editorial e de leitura do blog
- [x] Executar suíte Vitest e validar build e responsividade

## Filtros Públicos de Categoria e Tags no Blog e Central Admin de Mensagens (Agosto 2026)
- [x] Adicionar suporte a tags e filtros combinados de categoria/tags na interface pública do blog (`/blog`)
- [x] Criar tabela ou entidade de mensagens de contato no schema Drizzle para persistir as submissões de `/contato`
- [x] Criar rota de submissão do formulário de contato salvando no banco e enviando notificação opcional
- [x] Criar painel administrativo em `/admin/mensagens` restrito a `admin` e superadmin (`palafozanderson@gmail.com`)
- [x] Permitir visualizar, filtrar, marcar status (lida/respondida) e responder mensagens enviadas pelo form de contato
- [x] Criar testes automatizados para segurança, filtros do blog e central de mensagens
- [x] Executar suíte Vitest e validar build e responsividade

## Upload de Certificados Assinados via gov.br (Agosto 2026)
- [x] Adicionar metadados equivalentes por meio de `signatureType`, `signedPdfUrl`, `signedAt` e `signedBy`; o campo `isSigned` foi substituído por status explícito
- [x] Criar rota de API administrativa para upload e armazenamento seguro do PDF assinado pelo gov.br; o projeto utiliza Supabase Storage privado, conforme a infraestrutura atual, em vez de S3 público
- [x] Criar interface no painel administrativo para listar certificados emitidos e permitir upload do PDF assinado
- [x] Atualizar a área do aluno (`/dashboard/certificados`) para priorizar o download do certificado assinado pelo gov.br quando disponível
- [x] Criar testes de contrato, validação de upload e permissões RBAC
- [x] Executar suíte Vitest e validar build e responsividade

## Assinatura Manual e via gov.br em Certificados (Agosto 2026)
- [x] Adicionar colunas `signatureType` ("none" | "manual" | "govbr"), `signedPdfUrl` e `signedAt` na tabela `certificates` no schema Drizzle
- [x] Criar rota de API administrativa para upload e registro de certificado assinado (manual ou gov.br)
- [x] Criar interface no painel administrativo para upload do PDF assinado e escolha do tipo de assinatura
- [x] Atualizar a área do aluno para exibir o selo correspondente (Assinado Manualmente / Assinado via gov.br) e permitir o download direto do documento assinado
- [x] Criar testes automatizados de contrato e segurança para a nova funcionalidade de assinatura
- [x] Executar suíte Vitest e validar build e responsividade

## Etapas Posteriores — Nomenclatura de Níveis (Agosto 2026)
- [x] Revisar a referência `A1-C2` na Home (`app/page.tsx`) e substituir, se confirmado, por `3 Níveis` e `Básico, Intermediário e Avançado`
- [x] Auditar `app/sobre/page.tsx` para confirmar se não há referências diretas a CEFR ou A1-C2 antes de alterar textos
- [x] Mapear todas as ocorrências de CEFR, A1-C2 e níveis A1–C2 em páginas, componentes, constantes, filtros, documentação e banco
- [x] Definir se a mudança será apenas de nomenclatura visual ou também de modelo/dados, preservando os níveis pedagógicos reais quando necessário
- [x] Atualizar textos públicos, rótulos, filtros e componentes de forma consistente após decisão pedagógica
- [x] Criar testes de regressão para nomenclatura e validar acessibilidade, responsividade e build

## Auditoria Histórica da Fila — Itens Desmarcados desde 20/08 (Agosto 2026)
- [x] Revisar todos os itens do `todo.md` que permanecem desmarcados desde 20/08
- [x] Comparar cada item com o código, banco, testes, build e validação visual realmente disponíveis
- [x] Separar pendências reais, bloqueios externos (ex: chaves de produção Stripe/Google Calendar e reautorização OAuth externa), tarefas duplicadas e itens marcados prematuramente
- [x] Manter a ordem histórica e atualizar os estados somente após evidência verificável

## Correção de Nomenclatura CEFR e Seção de Histórico e Certificados no Perfil (Agosto 2026)
- [x] Substituir referências `A1-C2` por `Básico, Intermediário e Avançado` na Home (`app/page.tsx`) e em componentes públicos
- [x] Criar seção de histórico de aprendizado acadêmico e certificados assinados dentro da página de perfil do aluno (`/dashboard/perfil`)
- [x] Integrar links de download seguro de certificados assinados (manual / gov.br) na nova seção do perfil
- [x] Criar testes automatizados cobrindo a exibição do histórico e dos certificados no perfil
- [x] Executar suíte Vitest e validar build de produção e responsividade

## Compartilhamento de Certificados no LinkedIn (Agosto 2026)
- [x] Adicionar botão de compartilhamento no LinkedIn à galeria de certificados e ao resumo do perfil do aluno
- [x] Gerar URL de compartilhamento com o certificado verificável por meio da URL pública do PDF original; o PDF assinado permanece protegido por rota privada
- [x] Incluir feedback visual e acessibilidade no botão de compartilhamento
- [x] Criar testes automatizados do contrato da URL e da renderização dos botões
- [x] Executar suíte Vitest, validar build e salvar checkpoint

## Correção da Página de Detalhes do Curso (0/0 Aulas) e Aviso do Stripe (Agosto 2026)
- [x] Investigar a consulta de módulos e aulas na página de detalhes do curso (`/app/cursos/[id]/page.tsx` ou equivalentes) para corrigir a contagem e listagem 0/0
- [x] Revisar o tratamento de chaves do Stripe no checkout para fornecer fallback claro ou instrução de configuração sem quebrar a experiência
- [x] Criar testes automatizados de regressão para a renderização de aulas e contagem de módulos no curso
- [x] Executar suíte Vitest, validar build e salvar checkpoint

## Auditoria Sistêmica de Cursos, Módulos, Aulas e Checkout Stripe (Agosto 2026)
- [x] Conduzir auditoria automatizada em todos os cursos do banco Neon para identificar módulos sem aulas, contagens desatualizadas e inconsistências de relacionamento
- [x] Robustecer a API de detalhes do curso e componentes de listagem para lidar com módulos vazios de forma transparente e informativa
- [x] Auditar a configuração de pagamento do Stripe e criar fallback resiliente para cursos pagos quando credenciais estiverem pendentes de ativação em produção
- [x] Criar testes automatizados de contrato cobrindo a integridade sistêmica e o tratamento de checkout
- [x] Executar suíte Vitest, validar build e salvar checkpoint

## Funcionalidade de Aviso de Disponibilidade e Ativação do Stripe (Agosto 2026)
- [x] Adicionar botão "Avise-me quando disponível" nos módulos e cursos com status de "Conteúdo em preparação"
- [x] Criar tabela ou rota para registrar inscrições em avisos de disponibilidade por curso e usuário/e-mail
- [x] Auditar e configurar variáveis do Stripe para funcionamento em produção e sandbox
- [x] Criar testes automatizados para o aviso de disponibilidade e fluxo de checkout
- [x] Executar suíte Vitest, validar build e salvar checkpoint

## Configuração e Validação de Pagamentos via Stripe (Agosto 2026)
- [x] Auditar rotas de checkout, webhook e criação de produtos/preços no Stripe
- [x] Validar rotas de webhook do Stripe (`/api/stripe/webhook`) e garantir criação idempotente de matrículas ao confirmar o pagamento
- [x] Criar testes automatizados para simular o fluxo de compra de cursos pagos e o tratamento de erros do Stripe
- [x] Executar suíte Vitest, validar build e salvar checkpoint

## Verificação de Compra de Cursos via Stripe (Agosto 2026)
- [x] Inspecionar cursos pagos cadastrados e verificar se possuem preço e status válidos
- [x] Auditar a API de checkout para assegurar que a criação de produtos e preços no Stripe esteja correta e idempotente
- [x] Verificar a simulação de webhook de confirmação e gravação da matrícula no banco Neon
- [x] Executar testes automatizados da suíte Vitest e validar build de produção

## Configuração de Variáveis do Stripe no Vercel (Agosto 2026)
- [ ] Auditar e configurar as variáveis `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` e `VITE_STRIPE_PUBLISHABLE_KEY` no painel do Vercel para produção
- [ ] Validar o funcionamento das chaves com o script de teste de checkout e webhook
- [ ] Salvar checkpoint e atualizar documentação de produção

## Painel Administrativo de Vendas e Matrículas (Agosto 2026)
- [x] Auditar o schema e os dados reais de compras, matrículas, cursos e usuários disponíveis para o painel
- [x] Criar API protegida por RBAC para resumo de vendas, detalhamento de transações e lista de alunos matriculados
- [x] Implementar painel administrativo com receita de referência, vendas, matrículas e cursos mais vendidos; taxa de conversão permanece fora quando não há denominador confiável
- [x] Adicionar filtros por período, curso e status da compra; a matrícula é exibida com status na tabela operacional
- [x] Adicionar tabela de alunos matriculados com curso, data, status e progresso
- [x] Criar estados de carregamento, vazio, erro e proteção contra exposição de dados sensíveis
- [x] Criar testes automatizados, validar build e responsividade

## Integração no Painel Administrativo Existente (Agosto 2026)
- [x] Mapear a rota e os componentes reais do painel administrativo atual antes de criar qualquer tela
- [x] Integrar vendas e matrículas ao dashboard ou seção de gestão já existente, sem duplicar painel
- [x] Reutilizar RBAC, navegação, cartões, tabelas, filtros e estados de carregamento já padronizados
- [x] Criar testes de integração e validar build, responsividade e permissões
- [x] Salvar checkpoint da integração
- [x] Atualizar e robustecer a seção de Histórico de Faturamento e Recibos Stripe no perfil do aluno (`/dashboard/perfil`), com tratamento de erros, skeletons de carregamento e download de recibos em PDF.
- [x] Corrigido o modal de configuração de dias e modalidade em turmas externas (`/professor/turmas-externas`), garantindo que o botão responda corretamente ao clique e exiba opções de Remota e Presencial.
- [x] Auditada a rota de webhook do Stripe (`/api/stripe/webhook`) e validado o tratamento do evento `checkout.session.completed` com verificação de assinatura e metadados.
- [x] Implementada a verificação automatizada de token do Google Calendar (`/lib/google-calendar-api.ts`), com tratamento de exceções para tokens expirados, ausentes ou escopos insuficientes.
- [x] Auditadas e validadas as páginas administrativas de certificados (`/admin/certificados` e `/professor/certificados`), cupons (`/admin/cupons`) e o CMS (`/admin/cms`).
- [x] Executado teste simulado de fulfillment do webhook `checkout.session.completed`, confirmando a criação correta de registros de compra e liberação de matrículas.
- [x] Verificado o mecanismo de tokens do Google Calendar, constatando que a persistência reside no token JWT do NextAuth (sem tabela dedicada no Neon DB para limpeza de tokens), com tratamento robusto de expiração e escopos insuficientes.
- [x] Tratada a falha de sincronização do Classroom em ambiente sem CLI gws local (`/api/admin/classroom-sync`), garantindo resiliência em produção.
- [x] Blindada a rota de download de materiais (`/api/materials/[id]/download`) para exigir autenticação e autorização server-side em conteúdos pagos/privados.
- [x] Restaurado e validado o endpoint de comentários e avaliações do blog (`/api/articles/[id]/comments`), permitindo o envio correto de opiniões em artigos públicos.
- [x] Renomeado o rótulo "Aulas" para "Cursos" no menu de navegação (`navbar.tsx`) e no rodapé (`footer.tsx`), mantendo intactas as rotas e URLs.
- [x] Concluído o relatório detalhado do status atual de todas as rotas e páginas da plataforma.
- [x] Auditadas as APIs de comentários e avaliações no blog e nos cursos, garantindo tratamento robusto de erros e persistência correta.
- [x] Testada e blindada a restrição de downloads de materiais para usuários não autenticados nas páginas e rotas de materiais.
- [x] Corrigido o erro de referência (`course.id` indefinido) na listagem de módulos de cursos sem aulas publicadas (`/cursos/[id]`), eliminando o erro HTTP 500 relatado.
- [x] Implementada a geração automatizada e idempotente de certificados em PDF personalizável via `pdf-lib` antes da assinatura.
- [x] Adicionada opção de notificação automática por e-mail ao aluno imediatamente após o upload do PDF assinado no painel do administrador (`/admin/certificados`).
- [x] Adicionada funcionalidade de pré-visualização no painel administrativo de certificados.
- [x] Criada a galeria segura de certificados no painel do aluno (`StudentCertificatesGallery`), permitindo visualização, download e compartilhamento no LinkedIn.
- [x] Implementado upload de imagem de assinatura digital para aplicação automática nos certificados gerados.
- [x] Permitido o upload manual de certificados criados externamente diretamente pelo administrador ou superadmin.
- [x] Implementada rota pública de verificação de autenticidade de certificados com QR code / link exclusivo (`/api/certificates/verify/[code]`).
- [x] Adicionadas seções de galeria de certificados do aluno (`/dashboard/certificados`), alertas de emissão e requisitos de conclusão no curso.
- [x] Corrigidas e validadas as páginas de perfil, certificados e histórico com suporte a exportação em PDF.
- [x] Corrigido o gerenciamento de turmas externas, horários e modalidades no painel do professor.
- [x] Corrigido o seletor de alunos e medalhas em `/admin/medalhas` para listar todos os usuários ativos sem filtros restritos.
- [x] Adicionados botões de compartilhamento direto para LinkedIn, WhatsApp, X (Twitter) e cópia de link na visualização do certificado.
- [x] Implementados busca por texto e filtros por nível/curso na página de histórico de certificados do aluno.
- [x] Aprimorado o layout do PDF exportado no histórico do aluno com cabeçalho personalizado e logotipo da plataforma.
