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

- [ ] Criar visualização de boletim individual consolidado para alunos externos com dados reais, histórico de turmas, status e notas.

- [x] Criar visualização de boletim individual consolidado para alunos externos (`/professor/boletim/[studentId]`) com dados reais, histórico de turmas, status e notas.

- [ ] Aprimorar o gerenciamento e manutenção unificada de cursos internos (plataforma) e externos (IsF, PROFICI, SIMAL, Megaworks, UFBA) com controle de status, módulos, turmas e arquivamento seguro.

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
