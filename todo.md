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

## Auditoria e Blindagem de Páginas de Cursos (`/cursos/[id]`) — 19/08/2026
- [x] Auditar por que `/cursos/1` funcionava e outros IDs (como `/cursos/6`) falhavam (falta de tratamento de exceções em dados relacionais de módulos e aulas órfãs).
- [x] Blindar `CourseDetail` e `CourseModulesList` com blocos `try/catch` robustos.
- [x] Validar 100% de sucesso nos 320 testes Vitest.
