import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const notesRoute = readFileSync(join(process.cwd(), "app/api/notes/route.ts"), "utf8");
const dashboardRoute = readFileSync(join(process.cwd(), "app/api/dashboard/notes/route.ts"), "utf8");
const adminRoute = readFileSync(join(process.cwd(), "app/api/admin/notes/route.ts"), "utf8");
const lessonPage = readFileSync(join(process.cwd(), "app/cursos/[id]/aulas/[lessonId]/page.tsx"), "utf8");

 describe("lesson notes deletion and audit contracts", () => {
  it("allows a student to delete only their own note by lesson", () => {
    expect(notesRoute).toContain('export async function DELETE');
    expect(notesRoute).toContain("eq(lessonNotes.userId, userId)");
    expect(notesRoute).toContain("eq(lessonNotes.lessonId, lessonId)");
  });

  it("requires an administrator for cross-student deletion and records the actor", () => {
    expect(adminRoute).toContain("Somente administradores podem excluir anotações de alunos.");
    expect(adminRoute).toContain("deletedByAdminAt: new Date()");
    expect(adminRoute).toContain("deletedByAdminEmail: adminEmail");
    expect(adminRoute).toContain("logAdminActivity");
  });

  it("connects the lesson page to student deletion and administrative-deletion feedback", () => {
    expect(lessonPage).toContain('method: "DELETE"');
    expect(lessonPage).toContain("Excluir esta anotação definitivamente?");
    expect(lessonPage).toContain("Esta anotação foi excluída por um administrador");
    expect(lessonPage).toContain("deletedByAdminAt");
  });

  it("never exposes the original text after an administrative deletion", () => {
    expect(notesRoute).toContain('note: note.deletedByAdminAt ? "" : note.note');
    expect(dashboardRoute).toContain('note: item.deletedByAdminAt ? "" : item.note');
    expect(readFileSync(join(process.cwd(), "app/api/notes/export/route.ts"), "utf8")).toContain("Excluída por um administrador");
  });
});

export {};
