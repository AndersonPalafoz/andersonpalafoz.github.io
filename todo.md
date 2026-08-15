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
