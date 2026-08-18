import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("academic report pages", () => {
  it("uses direct Drizzle queries for the admin detailed report", () => {
    const source = read("app/api/admin/reports/route.ts");
    expect(source).toContain("db.select().from(users)");
    expect(source).toContain("db.select().from(courses)");
    expect(source).toContain("db.select().from(enrollments)");
    expect(source).toContain("db.select().from(progress)");
    expect(source).toContain("session.user.role !== \"admin\"");
  });

  it("uses stable direct queries on the individual teacher progress page", () => {
    const source = read("app/professor/progresso/page.tsx");
    expect(source).toContain("db.select().from(users)");
    expect(source).toContain("db.select().from(progress)");
    expect(source).toContain("db.select().from(enrollments)");
    expect(source).toContain("courseTitles.get(enrollment.courseId)");
    expect(source).toContain("session.user.role !== \"professor\"");
  });

  it("keeps the speaking progress route resilient with loading and error feedback", () => {
    const source = read("app/professor/progresso-aulas/page.tsx");
    expect(source).toContain("/api/professor/progress-speaking");
    expect(source).toContain("setLoading(false)");
    expect(source).toContain("toast.error");
    expect(source).toContain("Aguardando feedback");
  });
});


describe("private report visual consistency", () => {
  it("keeps the teacher progress report explicitly runtime-driven and tokenized", () => {
    const source = read("app/professor/progresso/page.tsx");
    expect(source).toContain('export const dynamic = "force-dynamic"');
    expect(source).toContain('export const revalidate = 0');
    expect(source).toContain("site-shell");
    expect(source).toContain("surface-card");
  });

  it("uses semantic surfaces and a loading skeleton in speaking progress", () => {
    const source = read("app/professor/progresso-aulas/page.tsx");
    expect(source).toContain("aria-busy=\"true\"");
    expect(source).toContain("surface-card h-64 animate-pulse");
    expect(source).toContain("field-control");
    expect(source).toContain("bg-muted/50");
  });

  it("tracks detailed report loading and exposes accessible report tabs", () => {
    const source = read("app/admin/relatorios/page.tsx");
    expect(source).toContain("detailsLoading");
    expect(source).toContain("aria-pressed");
    expect(source).toContain("data-table");
    expect(source).toContain("Carregando relatórios administrativos");
  });
});
