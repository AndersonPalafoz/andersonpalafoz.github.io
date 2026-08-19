import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (relativePath: string) => readFileSync(join(root, relativePath), "utf8");

describe("external class deletion safeguards", () => {
  const page = read("app/professor/turmas-externas/page.tsx");
  const route = read("app/api/professor/external-classes/route.ts");

  it("opens an accessible confirmation dialog before issuing the destructive request", () => {
    expect(page).toContain("classPendingDeletion");
    expect(page).toContain('role="dialog"');
    expect(page).toContain('aria-modal="true"');
    expect(page).toContain("aria-labelledby=\"delete-external-class-title\"");
    expect(page).toContain("Excluir definitivamente");
    expect(page).toContain("onClick={() => handleDeleteClass(cls.id)}");
    const deletionHandler = page.slice(page.indexOf("const handleDeleteClass"), page.indexOf("const handleSaveStudent"));
    expect(deletionHandler).not.toContain("window.confirm(");
  });

  it("keeps server-side ownership and trash/permanent deletion for external classes", () => {
    expect(route).toContain('action === "deleteClass"');
    expect(route).toContain('action === "restoreClass"');
    expect(route).toContain('action === "permanentDeleteClass"');
    expect(route).toContain("existingClass.teacherId !== teacher.id");
    expect(route).toContain("deletedAt");
  });
});

describe("homepage real-data contract", () => {
  const page = read("app/page.tsx");

  it("uses the database count for the public lesson indicator", () => {
    expect(page).toContain("getPublishedLessonCount");
    expect(page).toContain("db.select({ value: count() }).from(lessons)");
    expect(page).toContain("Conteúdo real disponível");
  });

  it("keeps the level naming parallel and removes the obsolete speaking claim", () => {
    expect(page).toContain("Básico ao Avançado");
    expect(page).toContain("[A1-C2]");
    expect(page).not.toContain("feedback instantâneo sobre pronúncia");
  });
});
