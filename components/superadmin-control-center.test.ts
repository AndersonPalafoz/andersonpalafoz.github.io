import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./superadmin-control-center.tsx", import.meta.url), "utf8");

describe("centro de governança do superadmin", () => {
  it("direciona somente para CMS, controles financeiros e auditoria", () => {
    expect(source).toContain('href: "/admin/cms"');
    expect(source).toContain('href: "/admin/cupons"');
    expect(source).toContain('href: "/admin/auditoria"');
    expect(source).toContain("Camada exclusiva");
  });
});
