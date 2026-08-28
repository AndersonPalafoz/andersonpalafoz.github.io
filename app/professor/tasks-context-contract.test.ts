import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync(new URL("./tarefas/page.tsx", import.meta.url), "utf8");
const route = readFileSync(new URL("../api/professor/tarefas/route.ts", import.meta.url), "utf8");
const schema = readFileSync(new URL("../../drizzle/schema.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../../drizzle/migrations/0080_activity_offer_context.sql", import.meta.url), "utf8");

describe("teacher tasks academic context contracts", () => {
  it("propagates offerId/classId through the teacher page and avoids admin mutations", () => {
    expect(page).toContain("useSearchParams");
    expect(page).toContain("/api/professor/tarefas");
    expect(page).toContain("taskContextPayload");
    expect(page).toContain("taskMutationEndpoint");
    expect(page).not.toContain("/api/admin/atividades");
  });

  it("resolves and authorizes the academic context before reading or mutating tasks", () => {
    expect(route).toContain("resolveAcademicContext");
    expect(route).toContain("resolveAndAuthorizeAcademicContext");
    expect(route).toContain("canManageCourse");
    expect(route).toContain("or(eq(activities.offerId, access.context.offerId!), isNull(activities.offerId))");
    expect(route).toContain("authorizeExistingActivity");
    expect(route).toContain("A tarefa não pertence ao contexto acadêmico informado.");
    expect(route).toContain("offerId e classId não pertencem ao mesmo contexto acadêmico.");
  });

  it("stores offer ownership while keeping offerId nullable for general legacy tasks", () => {
    expect(schema).toContain('offerId: integer("offerId").references(() => courseOffers.id');
    expect(migration).toContain('ALTER TABLE "activities" ADD COLUMN "offerId" integer;');
    expect(migration).toContain('ON DELETE set null');
    expect(route).toContain("export async function GET");
    expect(route).toContain("export async function POST");
    expect(route).toContain("export async function PUT");
    expect(route).toContain("export async function DELETE");
  });
});
