import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const routeSource = readFileSync(new URL("./route.ts", import.meta.url), "utf8");

describe("Admin stats commerce contract", () => {
  it("mantém a consulta comercial dentro da API administrativa", () => {
    expect(routeSource).toContain('session.user.role !== "admin"');
    expect(routeSource).toContain("getAdminCommerceStats");
    expect(routeSource).toContain("commerce");
  });
});
