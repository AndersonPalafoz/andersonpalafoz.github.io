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


## Fase 18: Correção de Login e Dashboard
- [x] Corrigir legibilidade da página /login (cores explícitas)
- [x] Corrigir botão "Entrar com Google" (vermelho #DC2626)
- [x] Corrigir página /dashboard com cores explícitas
- [x] Remover `trustHost: true` da configuração de NextAuth
- [ ] Testar autenticação e persistência de sessão no Vercel
- [ ] Validar redirecionamento após login
