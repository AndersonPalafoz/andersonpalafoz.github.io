import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./[id]/modulos/page.tsx", import.meta.url), "utf8");

describe("module creation modal contract", () => {
  it("exposes a highlighted action and accessible dialog", () => {
    expect(source).toContain("Adicionar módulo");
    expect(source).toContain("showModuleModal");
    expect(source).toContain('role="dialog"');
    expect(source).toContain('aria-modal="true"');
    expect(source).toContain("/api/admin/courses/${courseId}/modules");
  });
});
