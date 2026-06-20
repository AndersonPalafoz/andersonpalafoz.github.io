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

- [ ] Criar modelo de dados para Cursos
- [ ] Implementar cards de curso com progresso visual
- [ ] Criar página de detalhe do curso
- [ ] Implementar estrutura de Módulos dentro do curso
- [ ] Implementar estrutura de Aulas dentro do módulo
- [ ] Associar Materiais às aulas
- [ ] Criar player de aula com materiais integrados

## Fase 8: Blog / Knowledge Hub

- [ ] Criar modelo de dados para Artigos
- [ ] Implementar listagem de artigos com cards (título, categoria, tempo de leitura)
- [ ] Criar página individual de artigo
- [ ] Implementar sistema de categorias
- [ ] Adicionar breadcrumb em página de artigo
- [ ] Implementar paginação

## Fase 9: Biblioteca / Materiais

- [ ] Criar modelo de dados para Materiais
- [ ] Implementar listagem com categorias
- [ ] Adicionar badges de nível CEFR (A1, A2, B1, B2, C1, C2)
- [ ] Implementar filtros de conteúdo
- [ ] Criar página individual de material
- [ ] Adicionar sistema de download/acesso

## Fase 10: Skeleton Loaders e Estados de Carregamento

- [ ] Implementar skeleton loader para cards de curso
- [ ] Implementar skeleton loader para cards de artigo
- [ ] Implementar skeleton loader para cards de material
- [ ] Implementar skeleton loader para dashboard
- [ ] Remover todos os spinners infinitos
- [ ] Validar estados de carregamento em todas as páginas

## Fase 11: Responsividade e Acessibilidade

- [ ] Validar grid responsivo (4 colunas mobile, 8 tablet, 12 desktop)
- [ ] Testar navegação por teclado
- [ ] Validar contraste de cores (WCAG AA)
- [ ] Adicionar ARIA labels
- [ ] Testar com leitores de tela
- [ ] Implementar focus states visíveis

## Fase 12: SEO e Otimizações

- [ ] Adicionar meta tags nas páginas principais
- [ ] Implementar Open Graph tags
- [ ] Criar sitemap
- [ ] Adicionar robots.txt
- [ ] Validar performance (Lighthouse > 90)

## Fase 13: Testes e Validação

- [ ] Escrever testes unitários para componentes críticos
- [ ] Validar fluxo de autenticação
- [ ] Testar responsividade em múltiplos dispositivos
- [ ] Validar acessibilidade com ferramentas automatizadas
- [ ] Testar em navegadores principais

## Fase 14: Deploy e Publicação

- [ ] Fazer push para GitHub
- [ ] Validar build sem erros
- [ ] Verificar deploy na Vercel
- [ ] Validar domínio customizado
- [ ] Testar ambiente de produção

## Fase 15: Documentação e Entrega

- [ ] Documentar estrutura do projeto
- [ ] Criar guia de uso para o professor
- [ ] Preparar relatório final
- [ ] Entregar links e status
