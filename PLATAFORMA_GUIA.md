# Anderson Palafoz Platform - Guia Completo

## 📋 Visão Geral

A **Anderson Palafoz Platform** é uma plataforma educacional moderna e responsiva desenvolvida para o professor Anderson Palafoz. Oferece uma experiência pública para exploração de cursos e materiais, além de um dashboard privado para alunos autenticados.

**Stack Técnico:**
- **Frontend**: Next.js 19 + React + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Backend**: Express.js + tRPC 11
- **Database**: Supabase (PostgreSQL)
- **Authentication**: OAuth 2.0 (Google)
- **Deployment**: Vercel (Autoscale)

---

## 🎨 Identidade Visual

### Paleta de Cores Oficial
- **Primary**: #D62828 (Vermelho vibrante)
- **Primary Hover**: #B91C1C (Vermelho escuro)
- **Dark**: #333333 (Cinza escuro)
- **Light**: #F3F4F6 (Cinza claro)
- **White**: #FFFFFF (Branco)

### Tipografia
- **Font**: Poppins (Google Fonts)
- **Weights**: 400, 500, 600, 700

### Componentes
- Todos os componentes utilizam **shadcn/ui** customizados
- Dark mode suportado com tokens CSS
- Acessibilidade WCAG AA implementada

---

## 🏗️ Arquitetura do Projeto

```
andersonpalafoz.github.io/
├── client/                      # Frontend React
│   ├── src/
│   │   ├── app/                 # Rotas principais
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── pages/               # Páginas públicas e privadas
│   │   ├── hooks/               # Custom hooks
│   │   ├── lib/                 # Utilitários
│   │   ├── contexts/            # React contexts
│   │   ├── constants.ts         # Constantes globais
│   │   ├── index.css            # Estilos globais + design tokens
│   │   └── main.tsx             # Entry point
│   ├── public/                  # Assets estáticos (favicon, robots.txt)
│   └── index.html               # HTML template
├── server/                      # Backend Express + tRPC
│   ├── routers.ts               # Procedures tRPC
│   ├── db.ts                    # Query helpers
│   ├── storage.ts               # S3 helpers
│   └── _core/                   # Framework internals
├── drizzle/                     # Schema + migrations
│   ├── schema.ts                # Definição de tabelas
│   └── migrations/              # SQL migrations
├── shared/                      # Código compartilhado
│   ├── types.ts                 # Tipos TypeScript
│   └── const.ts                 # Constantes compartilhadas
└── references/                  # Documentação de integrações
    ├── llm-integration.md       # LLM/AI
    ├── file-storage.md          # S3 storage
    ├── voice-transcription.md   # Whisper API
    └── ...
```

---

## 📄 Páginas e Rotas

### Públicas (Sem Autenticação)
| Rota | Descrição |
|------|-----------|
| `/` | Home com hero, apresentação, seções de cursos/materiais/blog |
| `/about` | Sobre Anderson Palafoz |
| `/courses` | Listagem de cursos com filtros CEFR |
| `/materials` | Biblioteca de materiais com filtros por nível e categoria |
| `/blog` | Blog & Knowledge Hub com artigos |
| `/contact` | Formulário de contato |

### Privadas (Requer Autenticação)
| Rota | Descrição |
|------|-----------|
| `/dashboard/courses` | Cursos inscritos do aluno |
| `/dashboard/activities` | Atividades e tarefas |
| `/dashboard/library` | Biblioteca pessoal do aluno |
| `/dashboard/calendar` | Calendário de aulas |
| `/dashboard/certificates` | Certificados conquistados |
| `/dashboard/profile` | Perfil do aluno |

---

## 🗄️ Banco de Dados

### Tabelas Principais

#### `users`
Autenticação e perfil do usuário.
```sql
- id (PK)
- openId (OAuth identifier)
- name
- email
- role (user | admin)
- createdAt, updatedAt, lastSignedIn
```

#### `courses`
Cursos disponíveis na plataforma.
```sql
- id (PK)
- title
- description
- level (A1-C2)
- modules (número de módulos)
- instructor (padrão: Anderson Palafoz)
- createdAt, updatedAt
```

#### `enrollments`
Inscrições de alunos em cursos.
```sql
- id (PK)
- userId (FK)
- courseId (FK)
- progress (0-100)
- currentModule
- status (active | completed | paused)
- enrolledAt, completedAt
```

#### `materials`
Materiais educacionais (worksheets, slides, áudios).
```sql
- id (PK)
- title
- description
- category (Worksheets | Slides | Áudios | Exercícios | Artigos)
- level (A1-C2)
- fileUrl
- downloads
- createdAt, updatedAt
```

#### `articles`
Blog e Knowledge Hub.
```sql
- id (PK)
- title
- slug (URL-friendly)
- content
- category
- readingTime (em minutos)
- published
- createdAt, updatedAt
```

#### `certificates`
Certificados de conclusão.
```sql
- id (PK)
- userId (FK)
- courseId (FK)
- issuedAt
- expiresAt
- certificateUrl
```

#### `activities`
Atividades e tarefas.
```sql
- id (PK)
- courseId (FK)
- title
- description
- dueDate
- createdAt, updatedAt
```

#### `userActivityProgress`
Progresso do aluno em atividades.
```sql
- id (PK)
- userId (FK)
- activityId (FK)
- status (pending | completed | submitted)
- submittedAt
- grade
```

---

## 🔌 Procedures tRPC

### Autenticação
```typescript
auth.me                  // Retorna usuário autenticado
auth.logout              // Faz logout
```

### Cursos
```typescript
courses.list             // Lista todos os cursos
courses.enrollments      // Cursos inscritos do usuário
courses.enroll           // Inscreve usuário em curso
```

### Materiais
```typescript
materials.list           // Lista materiais com filtros
```

### Artigos
```typescript
articles.list            // Lista artigos publicados
articles.bySlug          // Artigo por slug
```

### Sistema
```typescript
system.health            // Health check
```

---

## 🔐 Autenticação

### Fluxo OAuth Google
1. Usuário clica em "Entrar"
2. Redirecionado para portal OAuth Manus
3. Autentica com Google
4. Callback em `/api/oauth/callback`
5. Session cookie criado
6. Redirecionado para dashboard

### Proteção de Rotas
- Hook `useProtectedRoute()` em páginas privadas
- Redirecionamento automático para home se não autenticado
- Loading state durante verificação

---

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 640px (1 coluna)
- **Tablet**: 640px - 1024px (2 colunas)
- **Desktop**: > 1024px (3+ colunas)

### Componentes Responsivos
- Navbar: hamburger em mobile, links em desktop
- Cards: grid dinâmico por breakpoint
- Filtros: quebrados em múltiplas linhas em mobile
- Sidebar: colapsível em mobile

---

## 🎯 Dados de Teste

### Cursos Inseridos
- English Basics (A1)
- Elementary English (A2)
- Intermediate Communication (B1)
- Upper Intermediate (B2)
- Advanced English (C1)
- Proficiency English (C2)

### Materiais Inseridos
- Phrasal Verbs Essentials (B1)
- Presentation Skills (B2)
- Pronunciation Guide (A2)
- Grammar Exercises (A1)
- Business English (B2)
- Idioms and Expressions (B1)

### Artigos Inseridos
- Metodologia CEFR: Entendendo os Níveis de Proficiência
- 10 Dicas de Pronúncia para Melhorar seu Inglês
- Phrasal Verbs: Guia Completo e Prático
- Imersão em Inglês: Estratégias Eficazes
- Gramática Essencial para Iniciantes
- Preparação para Certificações Internacionais

---

## 🚀 Deployment

### Vercel
- **URL**: https://andersonedu-ccizmxek.manus.space
- **Branch**: main
- **Auto-deploy**: Ativado (push para main = deploy automático)
- **Environment**: Production

### Variáveis de Ambiente
```
DATABASE_URL              # Supabase PostgreSQL
JWT_SECRET                # Session signing
VITE_APP_ID               # OAuth app ID
OAUTH_SERVER_URL          # OAuth backend
VITE_OAUTH_PORTAL_URL     # OAuth portal
OWNER_OPEN_ID             # Owner's OAuth ID
OWNER_NAME                # Owner's name
```

---

## 📊 Skeleton Loaders

Todos os estados de carregamento utilizam skeleton loaders em vez de spinners:
- Cards de cursos
- Cards de materiais
- Cards de artigos
- Dashboard sections
- Listas de atividades

---

## ♿ Acessibilidade

### WCAG AA Implementado
- ✅ Contraste de cores adequado
- ✅ ARIA labels em componentes interativos
- ✅ Navegação por teclado completa
- ✅ Focus states visíveis
- ✅ Semântica HTML correta
- ✅ Imagens com alt text

---

## 📖 Referência Bíblica

**Colossenses 3:23** aparece discretamente no rodapé:
> "E tudo quanto fizerdes, fazei-o de todo o coração, como para o Senhor, e não para os homens."

---

## 🔧 Desenvolvimento Local

### Instalação
```bash
cd andersonpalafoz.github.io
pnpm install
```

### Desenvolvimento
```bash
pnpm dev
```
Acessa em: http://localhost:3000

### Build
```bash
pnpm build
```

### Testes
```bash
pnpm test
```

### Type Check
```bash
pnpm check
```

---

## 📝 Próximos Passos

### Curto Prazo
- [ ] Implementar página individual de artigos
- [ ] Adicionar sistema de comentários no blog
- [ ] Criar página de detalhe do curso

### Médio Prazo
- [ ] Implementar módulos e aulas dentro dos cursos
- [ ] Adicionar sistema de progresso visual
- [ ] Criar player de vídeo para aulas
- [ ] Implementar sistema de certificados

### Longo Prazo
- [ ] Integração com plataformas de pagamento
- [ ] Sistema de notificações
- [ ] Relatórios e analytics
- [ ] Comunidade de alunos

---

## 📞 Suporte

Para dúvidas ou sugestões sobre a plataforma, entre em contato com Anderson Palafoz.

---

**Última atualização**: Junho 2026
**Versão**: 1.0.0
**Status**: Production Ready ✅
