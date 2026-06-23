# Guia de Compatibilidade: Manus + v0 + Anderson Palafoz Platform

Como usar o v0 do Vercel para editar a plataforma sem quebrar a integração com Manus.

---

## ⚠️ Regras Críticas

### 1. **NUNCA Delete Arquivos Core**
❌ **NÃO DELETE:**
- `server/` (backend tRPC)
- `drizzle/` (database schema)
- `shared/` (tipos compartilhados)
- `client/src/lib/trpc.ts` (tRPC client)
- `client/src/_core/` (hooks de auth)
- `package.json` (dependências)

✅ **SEGURO DELETAR:**
- Componentes específicos em `client/src/components/`
- Páginas em `client/src/pages/`
- Estilos locais

### 2. **NUNCA Mude Estrutura de Pastas**
❌ **NÃO MUDE:**
```
client/src/pages/     → Deve permanecer aqui
client/src/components/ → Deve permanecer aqui
server/routers.ts      → Deve permanecer aqui
```

✅ **SEGURO ORGANIZAR:**
- Criar subpastas dentro de `components/`
- Criar subpastas dentro de `pages/`
- Adicionar novos hooks em `client/src/hooks/`

### 3. **NUNCA Altere Tipos tRPC**
❌ **NÃO ALTERE:**
```typescript
// client/src/lib/trpc.ts
export const trpc = createTRPCReact<AppRouter>();
```

❌ **NÃO ALTERE:**
```typescript
// server/routers.ts
export const appRouter = router({
  auth: router({ ... }),
  courses: router({ ... }),
  // ...
});
```

✅ **SEGURO FAZER:**
- Adicionar novos procedures em `server/routers.ts`
- Criar novos routers em `server/routers/`
- Usar procedures existentes em componentes

### 4. **NUNCA Mude Dependências Core**
❌ **NÃO REMOVA:**
```json
"@trpc/client": "^11.6.0",
"@trpc/react-query": "^11.6.0",
"@trpc/server": "^11.6.0",
"drizzle-orm": "^0.44.5",
"mysql2": "^3.15.0",
"express": "^4.21.2",
"react": "^19.2.1",
"tailwindcss": "^4.1.14"
```

✅ **SEGURO ADICIONAR:**
- Novos pacotes UI: `pnpm add @heroicons/react`
- Utilitários: `pnpm add lodash-es`
- Validação: `pnpm add zod`

---

## ✅ Fluxo Seguro com v0

### Passo 1: Preparar Contexto
Antes de usar v0, forneça este contexto:

```
Estou usando:
- React 19 + TypeScript
- Tailwind CSS 4 com OKLCH colors
- shadcn/ui components
- tRPC para backend
- Wouter para routing

Estrutura:
- client/src/pages/ → Page components
- client/src/components/ → Reusable components
- client/src/hooks/ → Custom hooks
- server/routers.ts → tRPC procedures

Regras:
1. Use shadcn/ui para componentes
2. Mantenha TypeScript strict
3. Não altere server/ ou drizzle/
4. Use tRPC hooks: trpc.*.useQuery/useMutation
5. Proteja rotas privadas com useProtectedRoute()
```

### Passo 2: Pedir Componente Específico
Exemplo de prompt seguro:

```
Criar componente CourseCard em client/src/components/CourseCard.tsx

Props:
- title: string
- level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
- progress: number (0-100)
- modules: number
- onExplore: () => void

Use shadcn/ui Card, Badge, Progress
Use Tailwind para styling
```

### Passo 3: Revisar Código Gerado
Checklist antes de aceitar:

- [ ] Imports corretos (shadcn/ui, React)
- [ ] TypeScript types definidos
- [ ] Tailwind classes válidas
- [ ] Sem alterações em arquivos core
- [ ] Sem mudanças em package.json
- [ ] Sem novos arquivos em server/ ou drizzle/

### Passo 4: Testar Localmente
```bash
pnpm dev
# Verificar componente no navegador
# Testar responsividade
# Verificar console para erros
```

### Passo 5: Commit e Push
```bash
git add .
git commit -m "feat: Adicionar CourseCard component"
git push origin main
# Vercel faz deploy automático
```

---

## 🔄 Padrões de Código

### Componentes (shadcn/ui)
```typescript
// ✅ BOM: Usa shadcn/ui
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CourseCard({ title, level }) {
  return (
    <Card>
      <Badge>{level}</Badge>
      <h3>{title}</h3>
      <Button>Explorar</Button>
    </Card>
  );
}
```

### Hooks (tRPC)
```typescript
// ✅ BOM: Usa tRPC
import { trpc } from "@/lib/trpc";

export function CourseList() {
  const { data, isLoading } = trpc.courses.list.useQuery();
  
  if (isLoading) return <Skeleton />;
  return <div>{data?.map(...)}</div>;
}
```

### Rotas Privadas
```typescript
// ✅ BOM: Protege rota
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

export function DashboardPage() {
  useProtectedRoute(); // Redireciona se não autenticado
  
  return <div>Dashboard privado</div>;
}
```

### Tailwind (OKLCH)
```typescript
// ✅ BOM: Usa tokens CSS
<div className="bg-primary text-primary-foreground">
  Usa cores definidas em index.css
</div>

// ❌ RUIM: Hardcoded colors
<div style={{ backgroundColor: "#D62828" }}>
  Quebra dark mode
</div>
```

---

## 🚨 Cenários de Risco

### Risco 1: v0 Gera Novo Router tRPC
❌ **PROBLEMA:**
```typescript
// v0 cria novo arquivo
export const newRouter = router({
  newProcedure: publicProcedure.query(() => ({}))
});
```

✅ **SOLUÇÃO:**
Adicione ao `server/routers.ts` existente:
```typescript
export const appRouter = router({
  auth: router({ ... }),
  courses: router({ ... }),
  newFeature: router({ ... }) // ← Adicione aqui
});
```

### Risco 2: v0 Altera package.json
❌ **PROBLEMA:**
v0 remove ou altera dependências core

✅ **SOLUÇÃO:**
1. Rejeite mudanças em package.json
2. Instale novos pacotes manualmente: `pnpm add package`
3. Commit apenas código, não package.json

### Risco 3: v0 Cria Novo Arquivo de Config
❌ **PROBLEMA:**
v0 cria `tailwind.config.js` novo

✅ **SOLUÇÃO:**
Mantenha configs existentes:
- `tailwind.config.ts` (já existe)
- `vite.config.ts` (já existe)
- `tsconfig.json` (já existe)

### Risco 4: v0 Usa Componentes Não Instalados
❌ **PROBLEMA:**
v0 gera componente que precisa de `@heroicons/react`

✅ **SOLUÇÃO:**
1. Instale: `pnpm add @heroicons/react`
2. Ou peça v0 para usar `lucide-react` (já instalado)

---

## 📋 Checklist Pré-v0

Antes de usar v0:

- [ ] Leia este guia completamente
- [ ] Entenda a estrutura de pastas
- [ ] Saiba quais arquivos são core (não alterar)
- [ ] Tenha contexto claro do que quer criar
- [ ] Teste localmente após v0 gerar código
- [ ] Revise imports e tipos
- [ ] Commit apenas código seguro

---

## 🔧 Recuperação de Erros

### Se v0 Quebrou Algo

**Opção 1: Git Revert**
```bash
git log --oneline
git revert <commit-hash>
git push origin main
```

**Opção 2: Restaurar Arquivo**
```bash
git checkout HEAD -- server/routers.ts
git push origin main
```

**Opção 3: Rollback Checkpoint**
Use a Management UI do Manus para voltar a versão anterior

---

## 📚 Estrutura Segura para v0

```
client/src/
├── pages/                    ← v0 pode criar/editar
│   ├── Home.tsx
│   ├── Courses.tsx
│   ├── Materials.tsx
│   ├── Blog.tsx
│   ├── Contact.tsx
│   ├── About.tsx
│   ├── DashboardCourses.tsx
│   ├── DashboardActivities.tsx
│   ├── DashboardLibrary.tsx
│   ├── DashboardCalendar.tsx
│   ├── DashboardCertificates.tsx
│   ├── DashboardProfile.tsx
│   └── NotFound.tsx
│
├── components/               ← v0 pode criar/editar
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── SkeletonLoader.tsx
│   ├── StudentDashboardLayout.tsx
│   ├── CourseCard.tsx        ← v0 pode criar novo
│   ├── MaterialCard.tsx      ← v0 pode criar novo
│   ├── ArticleCard.tsx       ← v0 pode criar novo
│   └── ui/                   ← NÃO ALTERAR
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
│
├── hooks/                    ← v0 pode criar novo
│   ├── useAuth.ts
│   ├── useProtectedRoute.ts
│   └── useNewFeature.ts      ← v0 pode criar
│
├── lib/
│   ├── trpc.ts              ← NÃO ALTERAR
│   └── utils.ts             ← v0 pode editar
│
├── contexts/
│   └── ThemeContext.tsx      ← NÃO ALTERAR
│
├── constants.ts             ← v0 pode editar
├── index.css                ← NÃO ALTERAR (design tokens)
├── App.tsx                  ← v0 pode editar (rotas)
└── main.tsx                 ← NÃO ALTERAR
```

---

## 🎯 Melhores Práticas

1. **Use v0 para UI Components**
   - Cards, buttons, forms
   - Layouts responsivos
   - Componentes reutilizáveis

2. **Use Manus para Backend**
   - Procedures tRPC
   - Database schema
   - Autenticação

3. **Integre com Cuidado**
   - Teste localmente
   - Revise código gerado
   - Commit incrementais

4. **Documente Mudanças**
   - Commit messages claras
   - Atualize README se necessário
   - Comunique mudanças importantes

---

## 📞 Suporte

Se v0 quebrar algo:
1. Identifique o arquivo problemático
2. Use `git revert` para voltar
3. Tente novamente com contexto melhor
4. Ou edite manualmente

---

*Last updated: June 2026*
*Compatibilidade: v0 + Manus + Anderson Palafoz Platform*
