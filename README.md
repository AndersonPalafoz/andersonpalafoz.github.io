# Anderson Palafoz Platform

Plataforma educacional completa para ensino de inglês com área pública e privada para alunos.

## 🎯 Funcionalidades

### Área Pública
- **Home**: Hero section com apresentação
- **Cursos**: 6 cursos com níveis CEFR (A1-C2)
- **Materiais**: Biblioteca com filtros por nível
- **Blog**: Knowledge Hub com artigos educacionais
- **Sobre**: Informações do professor
- **Contato**: Formulário de comunicação

### Área Privada (Dashboard)
- **Cursos**: Acompanhamento de progresso
- **Atividades**: Tarefas e exercícios
- **Biblioteca**: Materiais exclusivos
- **Calendário**: Cronograma de aulas
- **Certificados**: Histórico de conclusões
- **Perfil**: Gerenciamento de dados

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express 4 + tRPC 11
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: OAuth Google via Manus
- **Deploy**: Vercel + GitHub
- **Build**: Vite + esbuild

## 📦 Instalação

```bash
# Instalar dependências
pnpm install

# Desenvolvimento
pnpm dev

# Build
pnpm build

# Produção
pnpm start
```

## 🗄️ Banco de Dados

7 tabelas principais:
- `users` - Usuários e autenticação
- `courses` - Cursos disponíveis
- `enrollments` - Inscrições de alunos
- `materials` - Materiais educacionais
- `articles` - Artigos do blog
- `certificates` - Certificados
- `activities` - Atividades e exercícios

## 🔐 Autenticação

- OAuth Google via Manus
- Roles: `admin` e `student`
- Admin padrão: `palafozanderson@gmail.com`

## 📱 Responsividade

- Mobile First (375px)
- Tablet (768px)
- Desktop (1280px+)
- Skeleton loaders em todos os estados de carregamento

## 🎨 Design System

- Tipografia: Poppins
- Paleta: #D62828 (Primary), #333333 (Dark), #F3F4F6 (Light)
- Dark mode totalmente funcional
- Componentes shadcn/ui customizados

## 📚 Documentação

- `PLATAFORMA_GUIA.md` - Guia técnico completo
- `GUIA_PROFESSOR.md` - Manual operacional
- `ARQUITETURA_TECNICA.md` - Stack e estrutura
- `GUIA_MANUTENCAO.md` - Procedimentos de manutenção
- `GUIA_V0_COMPATIBILIDADE.md` - Segurança com v0 do Vercel

## 🚀 Deploy

- **GitHub**: https://github.com/AndersonPalafoz/andersonpalafoz.github.io
- **Vercel**: https://vercel.com/palafozanderson-2076s-projects/andersonpalafoz
- **Preview**: https://andersonedu-ccizmxek.manus.space

## 📄 Licença

MIT
