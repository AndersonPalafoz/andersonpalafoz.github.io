# Anderson Palafoz Platform - TODO (Next.js + Neon)

## Fase 1: Estrutura Base ✅
- [x] Migrar de Vite + Express para Next.js 15 (App Router)
- [x] Configurar Tailwind CSS 4 com identidade visual
- [x] Criar páginas públicas: Home, Sobre, Aulas, Materiais, Blog, Contato
- [x] Criar estrutura de dashboard
- [x] Configurar Neon PostgreSQL com Drizzle ORM
- [x] Criar 8 tabelas no banco de dados
- [x] Configurar Vercel para deploy

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
- [ ] Criar API route POST /api/enrollments (inscrever em curso)
- [ ] Criar API route GET /api/user/enrollments (cursos do usuário)

## Fase 5: Integração com Banco de Dados
- [ ] Criar helpers Drizzle em lib/db.ts
- [ ] Implementar queries: getCourses(), getMaterials(), getArticles()
- [ ] Implementar queries: getUserEnrollments(), enrollUser()
- [ ] Testar conexão com Neon

## Fase 6: Páginas de Detalhe
- [ ] Criar página /cursos/[id] com detalhes do curso
- [ ] Criar página /materiais/[id] com detalhes do material
- [ ] Criar página /blog/[slug] com artigo completo
- [ ] Implementar breadcrumbs

## Fase 7: Componentes Reutilizáveis
- [ ] Criar componente CourseCard
- [ ] Criar componente MaterialCard
- [ ] Criar componente ArticleCard
- [ ] Criar componente ProgressBar
- [ ] Criar componente Modal

## Fase 8: Testes e Validação
- [ ] Testar build do Next.js
- [ ] Testar deploy no Vercel
- [ ] Validar responsividade (mobile, tablet, desktop)
- [ ] Testar autenticação Google
- [ ] Testar proteção de rotas

## Fase 9: Otimizações e Deploy
- [ ] Adicionar meta tags SEO
- [ ] Criar sitemap.xml
- [ ] Validar performance (Lighthouse)
- [ ] Fazer deploy final no Vercel
- [ ] Validar domínio customizado
