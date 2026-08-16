import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

describe("course cover removal flow", () => {
  it("keeps an explicit remove action behind an accessible confirmation dialog", () => {
    expect(pageSource).toContain("Remover capa");
    expect(pageSource).toContain("coverRemovalPending");
    expect(pageSource).toContain('aria-modal="true"');
    expect(pageSource).toContain("Remover imagem de capa?");
    expect(pageSource).toContain("confirmCoverRemoval");
  });
});
