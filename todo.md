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
- [ ] Adicionar breadcrumbs e navegação entre aulas

## Fase 12: Sistema de Progresso do Aluno ✅
- [x] Criar tabela Progress no banco de dados
- [x] Implementar API para salvar progresso de aula
- [x] Criar componente ProgressBar para mostrar progresso do curso
- [x] Adicionar cálculo de percentual de conclusão
- [x] Implementar badge de conclusão de curso

## Fase 13: Painel Admin (MVP)
- [ ] Criar página /admin/dashboard com estatísticas
- [ ] Criar CRUD de cursos: /admin/cursos
- [ ] Criar CRUD de materiais: /admin/materiais
- [ ] Criar CRUD de artigos: /admin/artigos
- [ ] Implementar proteção de rotas admin (apenas professor)
- [ ] Adicionar upload de imagens para cursos

## Fase 14: Integração com YouTube
- [ ] Criar helper para extrair ID de vídeo do YouTube
- [ ] Implementar componente YouTubePlayer com embed responsivo
- [ ] Adicionar controles de reprodução customizados
- [ ] Testar reprodução em mobile e desktop

## Fase 15: Integração com Google Drive
- [ ] Configurar Google Drive API
- [ ] Criar helper para listar arquivos do Google Drive
- [ ] Implementar download de materiais do Google Drive
- [ ] Adicionar preview de PDFs

## Fase 16: MVP Final - Testes e Deploy
- [ ] Testar fluxo completo: login, curso, progresso, admin
- [ ] Validar responsividade em mobile
- [ ] Testar performance com Lighthouse
- [ ] Fazer deploy final no Vercel
- [ ] Criar documentação de uso para Anderson
