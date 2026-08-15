# Anderson Palafoz Platform - TODO (Next.js + Neon)

## Fase 1: Estrutura Base ✅
- [x] Migrar de Vite + Express para Next.js 15 (App Router)
- [x] Configurar Tailwind CSS 4 com identidade visual
- [x] Criar páginas públicas: Home, Sobre, Aulas, Materiais, Blog, Contato
- [x] Criar estrutura de dashboard
- [x] Configurar Neon PostgreSQL com Drizzle ORM
- [x] Criar 8 tabelas no banco de dados
- [x] Configurar Vercel para deploy
- [x] Reconstruir homepage com visual branco e profissional
- [x] Criar navbar com logo SVG
- [x] Criar footer com links e redes sociais
- [x] Aplicar design consistente em todas as páginas

## Fase 2: Páginas do Dashboard ✅
- [x] Criar página Dashboard/Cursos com listagem
- [x] Criar página Dashboard/Atividades
- [x] Criar página Dashboard/Biblioteca
- [x] Criar página Dashboard/Calendário
- [x] Criar página Dashboard/Certificados
- [x] Criar página Dashboard/Perfil
- [x] Implementar sidebar de navegação do dashboard

## Fase 3: Autenticação Google OAuth ✅
- [x] Configurar NextAuth.js com Google OAuth
- [x] Criar página de login
- [x] Implementar proteção de rotas do dashboard
- [x] Criar hook useAuth() para verificar autenticação
- [x] Implementar logout

## Fase 4: API Routes e CRUD ✅
- [x] Criar API route GET /api/courses (listar cursos)
- [x] Criar API route GET /api/materials (listar materiais)
- [x] Criar API route GET /api/articles (listar artigos)
- [x] Criar e salvar `app/api/enrollments/route.ts` com POST autenticado
- [x] Criar `app/api/user/enrollments/route.ts` com GET autenticado

## Fase 5: Integração com Banco de Dados ✅
- [x] Criar helpers Drizzle em lib/db.ts
- [x] Implementar queries: getCourses(), getMaterials(), getArticles()
- [x] Implementar queries: getUserEnrollments(), enrollUser()
- [x] Validar a conexão com Neon com teste real

## Fase 6: Páginas de Detalhe ✅
- [x] Criar página /cursos/[id] com detalhes do curso
- [x] Criar página /materiais/[id] com detalhes do material
- [x] Criar página /blog/[slug] com artigo completo
- [x] Implementar breadcrumbs

## Fase 7: Componentes Reutilizáveis ✅
- [x] Criar componente CourseCard
- [x] Criar componente MaterialCard
- [x] Criar componente ArticleCard
- [x] Criar componente ProgressBar
- [x] Criar componente Modal

## Fase 8: Testes e Validação ✅
- [x] Corrigir build do Next.js (remover erros de prerender)
- [x] Testar deploy no Vercel
- [x] Validar responsividade (mobile, tablet, desktop)
- [x] Testar autenticação Google
- [x] Testar proteção de rotas

## Fase 9: Otimizações e Deploy ✅
- [x] Adicionar meta tags SEO
- [x] Criar sitemap.xml
- [x] Validar performance (Lighthouse)
- [x] Fazer deploy final no Vercel
- [x] Validar domínio customizado


## Fase 10: Correções de Design e Consistência Visual ✅

### Problemas Identificados
- [x] Remover SVGs distorcidos e usar imagens originais do projeto
- [x] Corrigir botões com fundo branco e texto branco (contraste inadequado)
- [x] Revisar todas as páginas para consistência visual
- [x] Padronizar cores, tipografia e espaçamento
- [x] Validar responsividade em todas as páginas
- [x] Testar contraste e acessibilidade

### Ações Necessárias
- [x] Usar logos originais (Horizontal-v1.png, principal.png) em vez de SVGs
- [x] Revisar paleta de cores (vermelho #DC2626, branco, cinza)
- [x] Corrigir botões outline (adicionar borda e texto visível)
- [x] Padronizar tamanhos de fonte e espaçamento
- [x] Aplicar design consistente em todas as 6 páginas públicas
- [x] Testar em mobile, tablet e desktop


## Fase 11: Sistema de Cursos e Aulas (MVP) ✅
- [x] Estender schema Drizzle com tabelas: Modules, Lessons, LessonProgress
- [x] Criar API routes: GET /api/courses/[id]/modules, GET /api/modules/[id]/lessons, POST /api/lessons/[id]/progress
- [x] Implementar página /cursos/[id]/aulas/[lessonId] com player de vídeo
- [x] Integrar YouTube Embed para reprodução de vídeos
- [x] Criar sistema de progresso: marcar aula como completa
- [ ] Adicionar breadcrumbs e navegação entre aulas (futuro)

## Fase 12: Sistema de Progresso do Aluno ✅
- [x] Criar tabela Progress no banco de dados
- [x] Implementar API para salvar progresso de aula
- [x] Criar componente ProgressBar para mostrar progresso do curso
- [x] Adicionar cálculo de percentual de conclusão
- [x] Implementar badge de conclusão de curso

## Fase 13: Painel Admin (MVP) ✅
- [x] Criar página /admin/dashboard com estatísticas
- [x] Criar CRUD de cursos: /admin/cursos
- [x] Criar CRUD de materiais: /admin/materiais
- [x] Criar CRUD de artigos: /admin/artigos
- [x] Implementar proteção de rotas admin (apenas professor)
- [x] Criar API routes para admin (cursos, materiais, artigos, stats)
- [x] Integrar dashboard com dados reais do banco
- [x] Criar testes para admin CRUD e validação de dados
- [ ] Adicionar upload de imagens para cursos (futuro)

## Fase 14: Integração com YouTube ✅
- [x] Criar helper para extrair ID de vídeo do YouTube
- [x] Implementar componente YouTubePlayer com embed responsivo
- [x] Integrar YouTubePlayer na página de aula
- [x] Criar componentes YouTubePlayerResponsive e YouTubePlayerGrid
- [x] Criar 18 testes para YouTube helper
- [x] Criar 22 testes para YouTubePlayer (aspect ratios, grid, gaps, responsividade)
- [x] Remover placeholders e validar production-ready

## Fase 15: Integração com Google Drive ✅
- [x] Criar helper lib/google-drive.ts com 8 funções
- [x] Criar 20 testes para Google Drive helper
- [x] Suporte a múltiplos formatos de URL
- [x] Suporte a export em PDF, DOCX, XLSX, PPTX
- [ ] Integrar com Google Drive API (requer autenticação - futuro)

## Fase 16: MVP Final - Testes e Deploy ✅
- [x] Testar fluxo completo: login, curso, progresso, admin
- [x] Validar responsividade em mobile
- [x] Testar performance com Lighthouse
- [x] Fazer deploy final no Vercel
- [x] Criar documentação de uso para Anderson (MVP_STATUS.md)
- [x] Implementar 80 testes em 5 suites (admin, db, youtube, googledrive, youtubePlayer)
- [x] Validar integração YouTube e Google Drive
- [x] Remover placeholders e validar production-ready
- [x] Corrigir userId hardcoded em app/api/lessons/[id]/progress/route.ts
- [x] Criar documentao de MVP com checklist de produção


## Fase 17: Correção de Design (Fundo Preto → Branco) ✅
- [x] Mudar tema padrão de dark para light em app/layout.tsx
- [x] Corrigir página /blog: fundo branco com cards
- [x] Corrigir página /blog/[slug]: fundo branco com tipografia profissional
- [x] Corrigir página /materiais: hierarquia visual melhorada
- [x] Testar todas as páginas em mobile (375px) e desktop (1280px)
- [x] Testar rota /blog/[slug] após mudança de tema


## Fase 18: Correção de Login e Dashboard ✅
- [x] Corrigir legibilidade da página /login (cores explícitas)
- [x] Corrigir botão "Entrar com Google" (vermelho #DC2626)
- [x] Corrigir página /dashboard com cores explícitas
- [x] Remover `trustHost: true` da configuração de NextAuth
- [x] Testar autenticação e persistência de sessão no Vercel (local)
- [x] Validar redirecionamento após login (local)


## Fase 19: Admin Access e Persistência de Sessão ✅
- [x] Configurar palafozanderson@gmail.com como admin
- [x] Adicionar lógica de auto-promoção para admin email
- [x] Melhorar callbacks de NextAuth (session, jwt, redirect)
- [x] Adicionar updateAge para atualizar sessão a cada 24h
- [ ] Testar persistência de sessão no Vercel após redeploy (pendente)
- [ ] Criar página /admin/usuarios para gerenciar permissões (futuro)
- [ ] Implementar proteção de rotas admin (apenas admin) (futuro)


## Fase 20: Gerenciamento de Usuários (Admin Panel) ✅
- [x] Criar página /admin/usuarios com tabela de usuários
- [x] Implementar CRUD de usuários (criar, editar, deletar)
- [x] Criar filtros por role (admin, aluno)
- [x] Implementar atribuição de roles (admin → aluno)
- [x] Adicionar proteção de rotas /admin/* (apenas admin)
- [x] Criar API routes para gerenciamento de usuários (/api/admin/users)
- [ ] Adicionar testes para gerenciamento de usuários (futuro)


## Diagnóstico de Estado Atual — 12/08/2026 ✅
- [x] Unificar rotas de administração de Artigos e Materiais com o banco de dados (removidas UIs estáticas de mock)
- [x] Executar testes automatizados (80 testes aprovados com Vitest)
- [x] Validar rotas públicas e administrativas no preview local
- [x] Consolidar o relatório técnico de diagnóstico e plano de ação em `DIAGNOSTICO_ATUAL.md`

---

## Registro de análise — resultados observados
- [x] Vitest executado: 5 arquivos e 80 testes aprovados
- [x] TypeScript e lint concluídos na etapa inicial do build
- [x] Build de produção falhou durante prerender de `/404` por ausência de `.next/prerender-manifest.json` após a falha de prerender
- [x] Preview local ficou indisponível depois que o processo de build removeu `.next` enquanto o servidor de desenvolvimento estava ativo
- [x] Foram capturadas evidências de falha de renderização em algumas rotas no preview local
- [ ] Rotas públicas e administrativas ainda precisam ser revalidadas depois do restart
- [ ] O estado de produção no Vercel ainda precisa ser comparado ao estado local
- [ ] A análise ainda não deve ser considerada encerrada

## Experiência Completa de Aulas para Alunos e Professores — 15/08/2026
- [ ] Criar página de player e consumo de aulas para alunos (`/cursos/[id]/aulas/[lessonId]`) com marcação de aula concluída
- [ ] Implementar componentes interativos de Listening e Speaking nas aulas (reprodução de áudio, gravação de voz no navegador e feedback direto)
- [ ] Adicionar upload de materiais complementares (PDFs e imagens) vinculados a cada aula por professores
- [ ] Validar testes automatizados e build de produção

## Painel Docente, Avaliação de Speaking e Progresso Visual — 15/08/2026
- [x] Criar painel do professor para monitorar progresso de aulas dos alunos e avaliar gravações de Speaking (`/professor/progresso-aulas`)
- [x] Integrar feedback automático de pronúncia por IA para submissões de Speaking
- [x] Adicionar barra de progresso visual de aulas na página do curso (`/cursos/[id]`)
- [x] Validar testes e build de produção

## Regravação de Speaking, Evolução e Certificados PDF — 15/08/2026
- [ ] Adicionar opção para o aluno regravar atividade de Speaking e comparar evolução com IA
- [ ] Implementar emissão automática de certificado PDF simples quando progresso do curso atingir 100%
- [ ] Permitir que professores adicionem comentários em texto ou áudio nas submissões de Speaking
- [ ] Validar testes automatizados e build de produção

## Aprovação de Progresso e Atribuição Direta — 15/08/2026
- [x] Adicionar funcionalidade para o professor/admin aprovar o progresso das aulas dos alunos
- [x] Permitir atribuir um aluno diretamente a um curso e/ou a um professor no painel de moderação
- [x] Validar testes automatizados e build de produção

## Investigação e Correção de Tarefas, Deadlines, Relatórios e Imagens — 15/08/2026
- [ ] Investigar e corrigir painel de Tarefas e Deadlines
- [ ] Investigar e corrigir Relatórios de Progresso (professor e super-admin)
- [ ] Investigar e corrigir fluxo de criação e inclusão de imagens (upload e link)
- [ ] Executar testes automatizados e build de produção

## Feedback Visual em Tarefas e Upload de Imagens — 15/08/2026
- [ ] Adicionar formulário interativo de criação de tarefas com animação de carregamento e toasts de sucesso/erro
- [ ] Refinar o componente de upload de imagens com indicador visual de progresso, feedback de sucesso e tratamento de erros
- [ ] Validar testes automatizados e build de produção

## Gestão Avançada de Tarefas e Exclusões Seguras — 15/08/2026
- [ ] Adicionar opções de filtro e ordenação por prazo e status na lista de tarefas
- [ ] Implementar barra de progresso visual de tarefas concluídas no painel
- [ ] Criar modal de confirmação para exclusão de tarefas e imagens
- [ ] Validar testes automatizados e build de produção

## Funcionalidades Avançadas de Tarefas e Modo Escuro — 15/08/2026
- [ ] Implementar edição rápida de título, prazo e status diretamente na lista de tarefas
- [ ] Implementar reordenação manual por drag-and-drop na interface de tarefas
- [ ] Adicionar botão de alternância para modo escuro (dark mode) no painel de tarefas
- [ ] Validar testes automatizados e build de produção

## Exportação, Pesquisa e Etiquetas em Tarefas (15/08/2026)
- [ ] Adicionar funcionalidade para exportar a lista de tarefas atual para CSV ou PDF
- [ ] Implementar barra de pesquisa no topo da lista para busca rápida por título
- [ ] Criar sistema de etiquetas (tags) coloridas personalizáveis para as tarefas
- [ ] Executar testes automatizados e build de produção

## Subtarefas, Checklists e Anexos em Tarefas (15/08/2026)
- [ ] Adicionar funcionalidade para criar subtarefas e checklists dentro de cada tarefa principal
- [ ] Implementar suporte para anexar links externos e arquivos de referência nos cards
- [ ] Executar testes automatizados e build de produção

## Progresso por Card e Recolhimento de Checklists (15/08/2026)
- [ ] Adicionar barra de progresso visual de subtarefas dentro de cada card de tarefa
- [ ] Implementar botão para expandir e recolher a seção de subtarefas e anexos
- [ ] Executar testes automatizados e build de produção

## Duplicação de Tarefas e Alertas Visuais de Prazos (15/08/2026)
- [ ] Adicionar funcionalidade para duplicar tarefas, copiando subtarefas e etiquetas
- [ ] Implementar alertas visuais claros para tarefas atrasadas e que vencem hoje
- [ ] Executar testes automatizados e build de produção

## Perfil na Sidebar, Autenticação Expandida e Pagamentos Stripe (15/08/2026)
- [ ] Adicionar foto/avatar de perfil na barra lateral do dashboard (/dashboard)
- [ ] Expandir métodos de login (Email/Senha e OAuth)
- [ ] Adicionar método de pagamento seguro (Stripe) para cursos pagos
- [ ] Executar testes automatizados e build de production

## Upload de Avatar, Recuperação de Senha e Confirmação Stripe (15/08/2026)
- [ ] Permitir upload e alteração de foto de perfil clicando no avatar da sidebar
- [ ] Implementar fluxo de 'esqueci minha senha' na tela de login
- [ ] Criar página de confirmação visual pós-pagamento via Stripe
- [ ] Executar testes automatizados e build de produção

## Plano de Integração Stripe (Payments, Billing e Invoicing) — 15/08/2026
- [ ] Instalar o plugin Stripe e configurar conectores MCP
- [ ] Conectar e autenticar o Stripe MCP (`https://mcp.stripe.com`)
- [ ] Gerar plano de implementação com o `stripe_implementation_planner`
- [ ] Revisar e aprimorar a integração de pagamentos para cursos digitais e materiais

## Histórico de Compras, Assinaturas, Recibos e Conteúdo Gratuito (15/08/2026)
- [ ] Criar painel de histórico de compras e gestão de assinaturas ativas para alunos
- [ ] Adicionar indicador visual nos cards de cursos para diferenciar cursos comprados/gratuitos
- [ ] Implementar página de recibo detalhado com opção de download / impressão
- [ ] Permitir a criação de cursos e materiais gratuitos no painel do professor/admin
- [ ] Executar testes automatizados e build de produção

## Aprimoramentos de Experiência do Aluno e Autenticação (15/08/2026)
- [ ] Adicionar filtros e ordenação do histórico de compras por data e valor
- [ ] Implementar barra de progresso em cada card de curso comprado
- [ ] Criar sistema de avaliações e comentários para cursos concluídos
- [ ] Adicionar fluxo de cadastro com e-mail/senha sem depender de conta Gmail
- [ ] Executar testes automatizados e build de produção

## Exportação, Favoritos, Notificações e Player de Aulas (15/08/2026)
- [ ] Adicionar exportação do histórico de compras em CSV e PDF no painel do usuário
- [ ] Implementar botão de favoritos/lista de desejos nos cards de cursos
- [ ] Criar alertas de notificação para respostas nas avaliações de cursos
- [ ] Concluir página de player e consumo de aulas (`/cursos/[id]/aulas/[lessonId]`) com marcação de aula concluída
- [ ] Executar testes automatizados e build de produção

## Retomada de Aula, Certificado Automático e Lista de Desejos (15/08/2026)
- [ ] Adicionar botão "Continuar de Onde Parei" no painel principal
- [ ] Implementar liberação automática de certificado PDF de conclusão ao atingir 100%
- [ ] Criar página dedicada `/dashboard/desejos` com pesquisa e filtros por categoria
- [ ] Executar testes automatizados e build de produção

## LinkedIn, Miniatura de Retomada e Compra Rápida (15/08/2026)
- [ ] Adicionar compartilhamento de certificado no LinkedIn
- [ ] Melhorar botão de retomada com miniatura e título da aula
- [ ] Adicionar botão "Comprar Agora" nos cards da Lista de Desejos
- [ ] Executar testes automatizados e build de produção

## Remoção em Desejos e Progresso na Retomada (15/08/2026)
- [ ] Adicionar botão de remoção ao lado de Comprar Agora na Lista de Desejos
- [ ] Adicionar barra de progresso visual e percentual na seção "Continuar de Onde Parei"
- [ ] Executar testes automatizados e build de produção

## Contador, Galeria de Certificados e Anotações (15/08/2026)
- [ ] Adicionar contador visual de cursos salvos no ícone da Lista de Desejos
- [ ] Criar galeria de certificados no painel do usuário com visualização e download
- [ ] Implementar campo de anotações pessoais persistentes no player de vídeo
- [ ] Executar testes automatizados e build de produção

## Central de Anotações e Animação de Contador (15/08/2026)
- [ ] Criar aba de anotações centralizadas no painel do usuário com pesquisa
- [ ] Adicionar exportação de anotações de aulas em PDF ou texto
- [ ] Implementar animação de pulso/destaque no ícone da Lista de Desejos ao atualizar contador
- [ ] Executar testes automatizados e build de produção

## Correção de Deploy Vercel (15/08/2026)
- [ ] Executar pnpm build e analisar logs de compilação
- [ ] Corrigir erros de tipagem, dependências ou conflitos de rotas Next.js
- [ ] Executar testes automatizados e build bem-sucedido

- [ ] Corrigir o visual, contraste e legibilidade da página pública de login (`/login`) em desktop e mobile

- [x] Criar um curso, um post e um material de teste na plataforma Anderson Palafoz

- [ ] Adicionar barra de pesquisa e filtros por nível de dificuldade nas listagens de cursos e materiais
- [ ] Melhorar animações de hover e indicadores de carregamento suaves nos cards de cursos e posts do blog
- [ ] Implementar seção de comentários e sistema de avaliação por estrelas na página de detalhes do post do blog

- [x] Esclarecer e aprimorar o fluxo de gerenciamento de módulos e aulas por curso no painel administrativo

- [ ] Adicionar visualizador de PDF integrado na página de detalhes do material (`/materiais/[id]`)
- [ ] Aprimorar a interface de criação de módulos com botão de destaque e modal intuitivo no painel
- [ ] Implementar sistema de progresso visual para marcar materiais baixados e cursos como concluídos

- [x] Esclarecer hierarquia Curso → Módulos e direcionar automaticamente para a criação de módulos após salvar um novo curso

- [x] Adicionar funcionalidade de arrastar e soltar para reordenar módulos e aulas no painel de gestão
- [x] Implementar navegação por breadcrumbs hierárquicos no painel administrativo
- [x] Permitir upload e vinculação de materiais de apoio (PDFs/exercícios) diretamente na interface de criação de aulas

- [x] Diferenciar materiais públicos de privados e cursos gratuitos de pagos no fluxo de publicação e na interface

- [x] Adicionar funcionalidade de upload e gerenciamento de imagens de capa para cursos no painel administrativo
- [x] Preparar infraestrutura e conector para integração segura com Google Drive
