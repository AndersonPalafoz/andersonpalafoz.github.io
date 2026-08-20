# Relatório de Auditoria e Especificação de Schema — Fase 1 (Cinco Tipos de Curso)

**Autor:** Manus AI  
**Revisor:** Anderson Palafoz  
**Plataforma:** Anderson Palafoz Platform  
**Data:** Agosto de 2026  
**Status:** Relatório Diagnóstico (Nenhuma alteração executada)  

---

## 1. Sumário Executivo

Este relatório apresenta a auditoria detalhada do banco de dados atual (**Neon PostgreSQL**) em relação à especificação oficial dos **cinco tipos de curso** (`TIPOS_DE_CURSOS_ESPECIFICACAO.md`). O objetivo é mapear quais colunas já existem na tabela `courses`, quais ajustes são estritamente necessários para suportar a Fase 1 do plano estratégico, e qual script de migração SQL será executado mediante aprovação.

Nenhuma alteração foi realizada automaticamente. Este documento serve como base técnica para validação e execução segura.

---

## 2. Auditoria do Schema Atual (`drizzle/schema.ts`)

A tabela `courses` atualmente possui os seguintes campos principais:
* `id` (serial, PK)
* `title` (varchar 255)
* `description` (text)
* `level` (varchar 10: A1-C2)
* `category` (varchar 120)
* `modules` (integer)
* `instructor` (varchar 255)
* `modality` (varchar 32)
* `isFree` (boolean)
* `price` (numeric 10,2)
* `imageUrl` (varchar 1000)
* `audioUrl` (varchar 1000)
* `videoUrl` (varchar 1000)
* `stripeProductId` & `stripePriceId` (varchar)
* `googleDriveLinks` (text)
* `classDays`, `classTime`, `workloadHours`, `startDate`, `endDate`, `maxAbsencePercent`
* `deletedAt` (timestamp para soft delete)

---

## 3. Identificação de Lacunas para os Cinco Tipos de Curso

Ao cruzar o schema atual com os requisitos das 5 modalidades (`TIPOS_DE_CURSOS_ESPECIFICACAO.md`), identificamos a necessidade de introduzir novos metadados específicos:

1. **Classificação Oficial do Tipo de Curso (`courseType`):** Atualmente, o sistema diferencia cursos por `modality` genérica. É necessário adicionar uma coluna dedicada `course_type` (inteiro de 1 a 5) para mapear inequivocamente as regras de negócio de cada modalidade.
2. **Link de Redirecionamento Externo (`externalRedirectUrl`):** Essencial para o *Tipo 1 (EAD Fechado)* e *Tipo 4 (Externo)*, permitindo redirecionar alunos para plataformas parceiras (Hotmart, Google Classroom ou sistemas corporativos).
3. **Formato de Atendimento Síncrono (`syncModality`):** Necessário para o *Tipo 2 (Híbrido)* e *Tipo 3 (Particular)*, definindo se os encontros são individuais, em grupo ou presenciais.

---

## 4. Proposta de Alterações Exatas em Drizzle ORM (`drizzle/schema.ts`)

Para suportar a Fase 1 mantendo 100% de compatibilidade retroativa com os dados existentes, propõe-se adicionar as seguintes colunas na tabela `courses`:

```ts
export const courses = pgTable("courses", {
  // ... campos existentes mantidos inalterados ...
  
  /** Tipo oficial do curso (1: EAD Fechado, 2: Híbrido, 3: Particular, 4: Externo, 5: Presencial). */
  courseType: integer("course_type").default(1).notNull(),
  
  /** URL opcional para redirecionamento externo (ex: Hotmart, Google Classroom). */
  externalRedirectUrl: varchar("external_redirect_url", { length: 1000 }),
  
  /** Especificação de atendimento síncrono (individual, group, online, presencial). */
  syncModality: varchar("sync_modality", { length: 64 }).default("none"),
});
```

---

## 5. Script de Migração SQL Proposto

O comando Drizzle Kit gerará (ou a migração direta via SQL executará) o seguinte comando DDL no Neon PostgreSQL:

```sql
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "course_type" integer DEFAULT 1 NOT NULL;
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "external_redirect_url" varchar(1000);
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "sync_modality" varchar(64) DEFAULT 'none';
```

---

## 6. Próximos Passos recomendados

1. **Aprovação do Diagnóstico:** Confirmar se o modelo proposto atende plenamente às expectativas operacionais de Anderson Palafoz.
2. **Execução da Migração:** Aplicar o schema atualizado e rodar a bateria de testes automatizados Vitest para garantir estabilidade absoluta antes de avançar para a Fase 2 (Refinamento da Interface Pública).

---
*Relatório de auditoria gerado para a Plataforma Anderson Palafoz.*
