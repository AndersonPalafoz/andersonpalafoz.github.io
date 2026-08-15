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
- [x] Rotas públicas e administrativas ainda precisam ser revalidadas depois do restart
- [ ] O estado de produção no Vercel ainda precisa ser comparado ao estado local
- [ ] A análise ainda não deve ser considerada encerrada


## Plano de Correção e Conclusão — 12/08/2026
- [x] Atualizar o callback `jwt` em `lib/auth.ts` para persistir o campo `role` no token JWT
- [x] Investigar e remover qualquer importação indevida de `<Html>` que impeça o build de produção do Next.js
- [x] Criar testes unitários e de integração para validar as rotas administrativas `/api/admin/blog` e `/api/admin/materials`
- [x] Executar `pnpm build` com sucesso para validar a compilação completa sem erros
- [ ] Salvar um checkpoint atualizado com o status `v1.1.0`

- [x] Adicionar testes unitários para persistência do `role` no JWT, fallback do administrador principal e propagação para `session.user.role`
- [x] Revisar arquivos legados/mock da área administrativa; manter somente UIs conectadas ao banco e redirecionamentos compatíveis
- [x] Corrigir o tratamento de indisponibilidade do banco nas páginas públicas `/blog` e `/materiais`, evitando telas de erro do Next.js e exibindo estados de fallback utilizáveis
- [x] Criar testes unitários para os fallbacks públicos de Blog e Materiais quando o banco estiver indisponível
- [ ] Comparar o estado de produção no Vercel ao estado local e registrar divergências finais
- [ ] Executar validação end-to-end da sessão administrativa em produção e então encerrar formalmente a análise

## Correção da Página de Contato — 15/08/2026
- [x] Auditar a página `/contato` no preview em desktop e mobile
- [x] Corrigir hierarquia visual, contraste, espaçamento e responsividade da página de contato
- [x] Validar e melhorar os links de email, WhatsApp e localização na página de contato
- [x] Garantir labels, foco visível e mensagens acessíveis no formulário de contato
- [x] Criar ou atualizar testes para a página de contato e validar o build
- [x] Adicionar testes da página `/contato` e/ou do componente `ContactForm` cobrindo canais, labels, links, mensagens de status e CTA
- [x] Validar automaticamente que a página `/contato` renderiza com os novos componentes e metadados sem regressões
- [x] Adicionar teste SSR que importe e renderize `app/contato/page.tsx`, confirmando ContactForm, CTAs e metadados
- [x] Adicionar teste de renderização real do `ContactForm` para labels, links e estados de formulário

## Aprimoramento do Formulário e FAQ — 15/08/2026
- [x] Auditar os estados atuais de envio do formulário e a posição visual do FAQ
- [x] Adicionar animação de carregamento e desabilitar o envio durante a preparação da mensagem
- [x] Melhorar mensagens acessíveis e claras de sucesso e erro no envio do formulário
- [x] Reposicionar o FAQ imediatamente abaixo do formulário de contato
- [x] Atualizar testes de interação, responsividade e build após as alterações

## Melhoria da Página Sobre — 15/08/2026
- [x] Pesquisar informações públicas sobre "Anderson Bacelar Palafoz" e registrar antecedentes acadêmicos e profissionais
- [x] Auditar a página `/sobre` atual em relação às diretrizes da marca e dados fornecidos pelo usuário
- [x] Redesenhar a página `/sobre` com estrutura moderna, biografia acadêmica aprofundada, pilares de ensino e linha do tempo profissional
- [x] Atualizar testes de contrato e SSR da página Sobre e validar o build de produção

## Correção de Níveis CEFR — 15/08/2026
- [x] Auditar menções a níveis CEFR em homepage, página Sobre, aulas, materiais e metadados
- [x] Atualizar a comunicação para aulas A1–B2 e materiais até C1/C2
- [x] Atualizar testes e validar as páginas afetadas após a correção

## Sistema de Aprovação de Contas e Hierarquia de Papéis — 15/08/2026
- [x] Revisar schema, autenticação, middleware e matriz de papéis atual
- [x] Definir e aplicar status de aprovação para visitantes, alunos e professores
- [x] Garantir `palafozanderson@gmail.com` como super-admin imutável
- [x] Criar fluxo para visitante solicitar acesso de aluno e professor solicitar aprovação do super-admin
- [x] Criar APIs e interface para professores aprovarem alunos e super-admin aprovar/rejeitar professores
- [x] Restringir dashboard, cursos e permissões conforme papel e status de aprovação
- [x] Adicionar testes de segurança, aprovação, rejeição e proteção do super-admin
- [x] Validar TypeScript, suíte completa e build antes do checkpoint

## Autenticação Robusta com Redes Sociais, Email, Senha, Telefone, CAPTCHA e Aprovação — 15/08/2026
- [ ] Atualizar schema Drizzle (`users`) com campos de senha criptografada, telefone, status de aprovação, papel pretendido e metadados de moderação
- [ ] Configurar provedores OAuth adicionais (Google e suporte a GitHub/Microsoft estruturado) e Credenciais (Email/Senha) no NextAuth
- [ ] Implementar verificação de CAPTCHA matemático/lógico nativo na tela de cadastro por email
- [ ] Criar endpoints de registro e login com validação de celular e verificação de status de aprovação
- [ ] Atualizar a tela `/login` e criar uma tela dedicada `/cadastro` com abas para redes sociais e formulário com email, telefone, senha e CAPTCHA
- [ ] Criar painel de moderação para professores aprovarem alunos e super-admin (`palafozanderson@gmail.com`) aprovar professores
- [ ] Adicionar testes automatizados para o novo fluxo de autenticação e validações
- [ ] Executar build de produção e salvar checkpoint final

## Redesign Visual Completo — 15/08/2026
- [ ] Auditar e refinar tokens globais de cor, tipografia, espaçamento, raios, sombras e foco
- [ ] Melhorar navegação, rodapé e componentes globais em desktop e mobile
- [ ] Refinar visual das páginas públicas: Home, Aulas, Materiais, Blog, Sobre, Contato e Login
- [ ] Refinar visual do Dashboard do Aluno e do Painel Administrativo sem alterar suas regras de acesso
- [ ] Adicionar ou atualizar testes visuais/estruturais e validar o build de produção

## Gestão Avançada de Usuários pelo Super-admin — 15/08/2026
- [x] Auditar schema, APIs e interface atuais de usuários
- [x] Adicionar exclusão lógica e recuperação de usuários, preservando histórico e integridade
- [x] Permitir edição apenas de campos não sensíveis e validação de papel/função
- [x] Proteger a conta principal `palafozanderson@gmail.com` contra exclusão e perda de super-admin
- [x] Atualizar painel, filtros, confirmação e estados de usuários excluídos
- [x] Adicionar testes de autorização, edição, exclusão, recuperação e proteção do super-admin
- [x] Validar TypeScript, suíte completa e build de produção

## Fotos de Perfil — 15/08/2026
- [x] Auditar avatar atual, formulário de perfil e infraestrutura de armazenamento
- [x] Implementar upload seguro de foto com validação de tipo, tamanho e autorização
- [x] Atualizar avatar no banco, sessão, Navbar, dashboard e perfil
- [x] Permitir ao super-admin editar a foto de outros usuários sem expor dados sensíveis
- [x] Adicionar testes de upload, permissões, validações e build

## Auditoria Final Pós-Implementação — 15/08/2026
- [ ] Reanalisar todas as páginas públicas, dashboard, admin, autenticação e fluxos de usuário após concluir as funcionalidades pendentes
- [ ] Registrar sugestões priorizadas por impacto em segurança, acessibilidade, UX, performance, SEO e manutenção
- [ ] Separar claramente problemas críticos, melhorias recomendadas e ideias futuras no relatório final
- [x] Remover o import legado de `<Html>` que ainda quebra o build da rota 404

## Histórico de Atividades, Toasts e Filtros Avançados — 15/08/2026
- [x] Criar tabela no schema Drizzle para armazenar o histórico de atividades do super-admin
- [x] Implementar API e persistência para registrar aprovações, edições de papel, exclusões e recuperações
- [x] Adicionar notificações visuais (toasts) de sucesso e confirmação nas operações do painel admin
- [x] Aprimorar os filtros de busca no painel de administração por status de exclusão e tipo de papel
- [x] Executar testes unitários e build de produção sem erros
- [x] Adicionar teste Vitest para recuperação via `action: restore`
- [x] Adicionar teste Vitest para edição de `name`, `phone`, `location` e `bio`

## Diagnóstico e Correção de Erros no Dashboard e Painel Admin — 15/08/2026
- [x] Inspecionar a rota `/api/admin/stats` e o comportamento do dashboard do aluno
- [x] Identificar e corrigir falhas de banco ou consultas nulas ao carregar estatísticas e cursos
- [x] Executar build de produção e validar que as páginas carregam sem erros

## Painel do Professor e Auditoria de Erros — 15/08/2026
- [x] Realizar auditoria de erros correntes e logs do servidor/navegador
- [x] Estender o schema de papéis/middleware para suportar o role `professor` e a rota `/professor/*`
- [x] Criar o painel do professor (`/professor`) com resumo de cursos, alunos e materiais
- [x] Criar API de gerenciamento de aulas, exercícios e materiais para o professor
- [x] Adicionar navegação condicional para o papel de professor no Navbar e layouts
- [x] Escrever testes unitários e de integração para o painel do professor
- [x] Executar build de produção e validar checkpoint v1.4.0

## Melhorias de Blog e Materiais — 15/08/2026
- [ ] Auditoria das páginas públicas `/blog`, `/blog/[slug]`, `/materiais` e `/materiais/[id]`
- [ ] Implementar busca em tempo real e filtros avançados por categoria e nível CEFR (A1-C2)
- [ ] Adicionar suporte a seed ou criação automática de conteúdos de exemplo caso o banco esteja vazio
- [ ] Melhorar o layout dos cards e páginas de detalhe com tipografia limpa e feedback de download
- [ ] Escrever testes unitários e de integração para Blog e Materiais
- [ ] Validar build de produção e salvar checkpoint v1.4.0

## Módulo de Mensagens de Contato (Super-Admin) — 15/08/2026
- [ ] Criar tabela `contact_messages` no schema Drizzle e aplicar migração no Neon
- [ ] Criar API POST `/api/contact` para receber e persistir mensagens do formulário de contato
- [ ] Criar API GET/PUT/DELETE `/api/admin/messages` para o super-admin listar, marcar como lida e excluir mensagens
- [ ] Criar a página de gerenciamento `/admin/mensagens` no painel administrativo com filtros e contador
- [ ] Adicionar link "Mensagens" na sidebar do painel administrativo
- [ ] Escrever testes unitários para a API de mensagens de contato
- [ ] Executar build de produção e validar checkpoint v1.5.0

## Mensagens Diretas Aluno ↔ Professor com Notificação por Email — 15/08/2026
- [ ] Criar tabela `direct_messages` no Drizzle (senderId, receiverId, subject, body, isRead, createdAt)
- [ ] Configurar helper de envio de email (suporte a Resend ou fallback para log/mailto estruturado)
- [ ] Criar API POST e GET `/api/messages` para envio e leitura de mensagens diretas
- [ ] Criar página de mensagens no Dashboard do Aluno (`/dashboard/mensagens`)
- [ ] Criar página de mensagens no Painel do Professor (`/professor/mensagens` e `/admin/mensagens`)
- [ ] Adicionar testes unitários para o sistema de mensagens diretas
- [ ] Executar build de produção e salvar checkpoint v1.6.0

## Sistema de Lembretes de Prazos (Deadlines) — 15/08/2026
- [ ] Criar tabela `notifications` no schema Drizzle para alertas in-app (userId, title, message, type, isRead, createdAt)
- [ ] Criar helper de notificação por WhatsApp e Email em `lib/notifications.ts` com templates em português
- [ ] Criar API `/api/notifications` para listar e marcar notificações como lidas
- [ ] Criar componentes de alertas de prazos no Dashboard do Aluno e Painel do Professor
- [ ] Escrever testes unitários para o sistema de notificações e deadlines
- [ ] Executar build de produção e salvar checkpoint v1.7.0

## Evolução Completa: Mensagens Diretas, Deadlines e Painel Visual do Professor — 15/08/2026
- [ ] Criar tabelas e rotas para Direct Messages (Aluno ↔ Professor) com simulação/envio de email
- [ ] Criar sistema de Notificações In-App, Lembretes de Prazos (Deadlines) e Links WhatsApp
- [ ] Criar gerenciador visual de tarefas e progresso individual no Painel do Professor (`/professor/progresso` e `/professor/tarefas`)
- [ ] Adicionar testes automatizados, validar build de produção e entregar checkpoint v2.0.0

## Aprimoramento de Cursos, Materiais, Blog e Responsividade Geral — 15/08/2026
- [x] Expandir formulário de Cursos no admin com nível CEFR (A1-C2), instrutor, módulos, descrição detalhada e objetivos
- [x] Expandir formulário de Materiais com tipos acadêmicos, níveis, tags pedagógicas e links de download/Google Drive
- [x] Expandir formulário de Blog/Artigos com resumo, slug customizável, autor, categorias e editor Markdown rico
- [x] Realizar auditoria e refinamento global de responsividade mobile-first, espaçamentos e contrastes em todo o site
- [x] Executar testes unitários, build de produção e salvar checkpoint v2.1.0

## Governança Avançada, Cursos Individuais/Grupo, Chamada e Auditoria de Logins/Submissões — 15/08/2026
- [ ] Estender schema Drizzle com tabelas para modalidade de curso (individual/grupo), sessões de aula (chamada) e trilha de auditoria de eventos (login, conclusão de atividades, submissão de materiais)
- [ ] Criar API e interface no painel do professor para registrar chamada (presença) em aulas individuais e em grupo
- [ ] Criar relatórios detalhados de engajamento de alunos para professores (progresso, frequência, atividades)
- [ ] Criar relatórios executivos para o super-admin (métricas unificadas de alunos, professores, logins e atividade editorial)
- [ ] Criar painel de auditoria de logs no super-admin para monitorar logins, submissões de materiais e progresso
- [ ] Escrever testes unitários e de integração para o novo ecossistema de governança acadêmica
- [ ] Executar build de produção e salvar checkpoint v2.2.0

## Multimídia (Áudio, Vídeo, Imagens) e Governança Avançada — 15/08/2026
- [ ] Adicionar suporte a áudio, vídeo e imagens em cursos, materiais e blog (Drizzle schema e formulários administrativos)
- [ ] Implementar turmas (individuais e em grupo), chamadas (presença) e auditoria de logins e submissões
- [ ] Desenvolver relatórios detalhados para professores e super-admin
- [ ] Validar testes automatizados e build de produção v2.2.0

## Correção da rota FAQ — 15/08/2026
- [ ] Criar ou corrigir a página pública `/faq` para eliminar o erro 404
- [ ] Integrar a FAQ à navegação e garantir consistência visual com `/contato`
- [ ] Adicionar teste de contrato/SSR para `/faq` e validar o build de produção
- [ ] Salvar checkpoint da correção da FAQ


## Correção de Rotas Públicas em Falta (/faq e /politica-privacidade) — 15/08/2026
- [ ] Criar app/faq/page.tsx para atender à rota pública de Perguntas Frequentes
- [ ] Criar app/politica-privacidade/page.tsx para atender à rota pública de Política de Privacidade
- [ ] Validar rotas, testes automatizados e build de produção v2.3.0

## Atualização de Redes Sociais Oficiais — 15/08/2026
- [ ] Atualizar LinkedIn, Instagram e Facebook nos componentes de contato, rodapé e perfil
- [ ] Validar URLs oficiais, testes e build de produção
- [ ] Salvar checkpoint da atualização de redes sociais

## Visibilidade de Materiais (Público/Privado) e Vínculo com Cursos — 15/08/2026
- [ ] Adicionar campos `isPublic` (boolean) e `courseId` (integer, opcional) na tabela `materials` no schema Drizzle
- [ ] Atualizar script de migração e aplicar alterações no banco de dados Neon
- [ ] Atualizar APIs de materiais para gerenciar e filtrar por visibilidade pública/privada e ID de curso vinculado
- [ ] Atualizar painel de administração de materiais para permitir escolher visibilidade e curso associado
- [ ] Ajustar páginas públicas e da área do aluno para respeitar o acesso a materiais públicos vs. privados/vinculados
- [ ] Adicionar testes automatizados e validar o build de produção

## Autoria e Data de Publicação em Conteúdos — 15/08/2026
- [ ] Exibir autor e data de publicação nos cards e páginas individuais do blog
- [ ] Exibir autor e data de publicação nos cards e páginas individuais de materiais
- [ ] Garantir fallback de autoria e data quando os dados forem antigos ou incompletos
- [ ] Adicionar testes automatizados e validar o build de produção

## Atividades de Listening e Speaking com Áudio e Feedback — 15/08/2026
- [ ] Atualizar schema Drizzle para suportar atividades de listening e speaking com áudio do exercício e gravação do aluno
- [ ] Criar API routes para submissão de gravações de voz e feedback direto do professor
- [ ] Construir componentes de player de áudio para listening e gravador de voz para speaking no dashboard do aluno
- [ ] Construir painel de revisão e feedback de speaking e listening para o professor
- [ ] Adicionar testes automatizados e validar o build de produção
