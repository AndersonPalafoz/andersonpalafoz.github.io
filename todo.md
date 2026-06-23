# Anderson Palafoz Platform - TODO

## Fase 1: Identidade Visual e Configuração Base

- [x] Configurar fonte Poppins via Google Fonts
- [x] Customizar paleta de cores no Tailwind (Primary #D62828, Dark #333333, Light #F3F4F6, White #FFFFFF)
- [x] Implementar dark mode com tokens específicos
- [x] Customizar componentes shadcn/ui conforme design system
- [x] Criar arquivo de constantes e tipos globais

## Fase 2: Navegação e Layout Base

- [x] Implementar Navbar sticky (72px) com efeito blur
- [x] Adicionar logo AP na navbar
- [x] Criar links de navegação: Home, Sobre, Aulas, Materiais, Blog, Contato
- [x] Implementar botão de login na navbar
- [x] Criar layout base responsivo (Mobile First)

## Fase 3: Página Home Pública

- [x] Criar hero section com CTA principal
- [x] Implementar seção de apresentação de Anderson Palafoz
- [x] Adicionar seção de Aulas com cards
- [x] Adicionar seção de Materiais com cards
- [x] Adicionar seção de Blog com cards de artigos
- [x] Implementar rodapé com referência Colossenses 3:23 (discreta)
- [x] Validar responsividade e acessibilidade

## Fase 4: Páginas Públicas Adicionais

- [x] Criar página de Sobre
- [x] Criar página de Cursos com listagem completa
- [x] Criar página de Materiais com filtros
- [x] Criar página de Blog com artigos
- [x] Criar página de Contato com formulário
- [x] Integrar todas as rotas no App.tsx
- [x] Validar navegação entre páginas

## Fase 5: Autenticação e Sistema de Roles

- [ ] Configurar OAuth Google (preparar estrutura)
- [ ] Implementar fluxo de login/logout
- [ ] Criar sistema de roles: admin e student
- [x] Proteger rotas privadas com hook useProtectedRoute
- [x] Implementar redirecionamento pós-login em todas as páginas do dashboard

## Fase 5.5: Componentes e Utilitários

- [x] Criar componente SkeletonLoader reutilizável
- [x] Corrigir página de Contato com formulário funcional
- [x] Substituir links placeholder por destinos reais
- [x] Criar componente StudentDashboardLayout (sidebar 280px)
- [x] Criar página DashboardCourses com cards de progresso
- [x] Integrar rota /dashboard/courses
- [x] Corrigir CTA da Home para /dashboard/courses

## Fase 6: Dashboard Privado do Aluno

- [x] Criar layout de dashboard com sidebar (280px)
- [x] Implementar navegação lateral: Cursos, Atividades, Biblioteca, Calendário, Certificados, Perfil
- [x] Criar página de Cursos com listagem em cards de progresso
- [x] Criar página de Atividades
- [x] Criar página de Biblioteca do aluno
- [x] Criar página de Calendário
- [x] Criar página de Certificados
- [x] Criar página de Perfil do aluno
- [x] Integrar todas as rotas do dashboard no App.tsx

## Fase 7: Sistema de Cursos

- [x] Criar modelo de dados para Cursos (tabela courses)
- [x] Implementar CRUD de Cursos (helpers em server/db.ts)
- [x] Implementar procedures tRPC para Cursos (courses.list, courses.enrollments, courses.enroll)
- [x] Implementar cards de curso com progresso visual
- [x] Inserir dados de teste de cursos (6 cursos A1-C2)
- [ ] Criar página de detalhe do curso
- [ ] Implementar estrutura de Módulos dentro do curso
- [ ] Implementar estrutura de Aulas dentro do módulo
- [ ] Associar Materiais às aulas
- [ ] Criar player de aula com materiais integrados

## Fase 8: Blog / Knowledge Hub

- [x] Criar modelo de dados para Artigos (tabela articles)
- [x] Implementar CRUD de Artigos (helpers em server/db.ts)
- [x] Implementar procedures tRPC para Artigos (articles.list, articles.bySlug)
- [x] Implementar listagem de artigos com cards (título, categoria, tempo de leitura)
- [x] Inserir dados de teste de artigos (6 artigos com categorias)
- [ ] Criar página individual de artigo com conteúdo real
- [ ] Implementar sistema de categorias
- [ ] Adicionar breadcrumb em página de artigo
- [ ] Implementar paginação

## Fase 9: Biblioteca / Materiais

- [x] Criar modelo de dados para Materiais (tabela materials)
- [x] Implementar CRUD de Materiais (helpers em server/db.ts)
- [x] Implementar procedures tRPC para Materiais (materials.list)
- [x] Implementar listagem com categorias
- [x] Adicionar badges de nível CEFR (A1, A2, B1, B2, C1, C2)
- [x] Implementar filtros de conteúdo
- [x] Inserir dados de teste de materiais (6 materiais com níveis CEFR)
- [ ] Criar página individual de material
- [ ] Adicionar sistema de download/acesso real

## Fase 10: Skeleton Loaders e Estados de Carregamento

- [x] Criar componente SkeletonLoader reutilizável
- [x] Implementar loading states em todas as páginas do dashboard
- [ ] Implementar skeleton loader para cards de curso públicos
- [ ] Implementar skeleton loader para cards de artigo públicos
- [ ] Implementar skeleton loader para cards de material públicos
- [ ] Remover todos os spinners infinitos
- [ ] Validar estados de carregamento em todas as páginas

## Fase 11: Responsividade e Acessibilidade

- [x] Validar grid responsivo (4 colunas mobile, 8 tablet, 12 desktop)
- [x] Validar responsividade em mobile (375px) - Screenshots OK
- [x] Validar responsividade em tablet (768px) - Screenshots OK
- [x] Validar responsividade em desktop (1280px) - Screenshots OK
- [ ] Testar navegação por teclado completa
- [ ] Validar contraste de cores (WCAG AA) - Auditoria completa
- [ ] Adicionar ARIA labels em componentes interativos
- [ ] Testar com leitores de tela
- [ ] Implementar focus states visíveis em todos os elementos

## Fase 12: SEO e Otimizações

- [ ] Adicionar meta tags dinâmicas nas páginas principais
- [ ] Implementar Open Graph tags
- [ ] Criar sitemap.xml
- [ ] Adicionar robots.txt
- [ ] Validar performance (Lighthouse > 90)
- [ ] Validar Core Web Vitals

## Fase 13: Testes e Validação

- [ ] Escrever testes unitários com Vitest para procedures tRPC
- [ ] Testar autenticação OAuth Google end-to-end
- [ ] Testar proteção de rotas do dashboard
- [ ] Testar fluxo de inscrição em cursos
- [ ] Testar em navegadores principais (Chrome, Firefox, Safari, Edge)

## Fase 14: Deploy e Publicação

- [x] Fazer push para GitHub (branch main)
- [x] Validar build sem erros (pnpm check OK)
- [ ] Verificar deploy automático na Vercel
- [ ] Validar domínio customizado
- [ ] Testar ambiente de produção (autenticação, banco de dados)

## Fase 15: Documentação e Entrega

- [x] Documentar arquitetura do projeto (PLATAFORMA_GUIA.md criado)
- [x] Criar guia de uso para o professor (PLATAFORMA_GUIA.md)
- [x] Documentar procedures tRPC disponíveis (PLATAFORMA_GUIA.md)
- [x] Criar guia de manutenção e atualizações (PLATAFORMA_GUIA.md)
- [ ] Preparar relatório final e entregar links
