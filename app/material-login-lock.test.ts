import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Material Login Lock", () => {
  it("renders an accessible login lock with tooltip for anonymous users", () => {
    const component = readFileSync(join(process.cwd(), "components/material-login-lock.tsx"), "utf8");
    const materialsPage = readFileSync(join(process.cwd(), "app/materiais/page.tsx"), "utf8");
    const materialDetail = readFileSync(join(process.cwd(), "app/materiais/[id]/page.tsx"), "utf8");

    expect(component).toContain("Lock");
    expect(component).toContain('role="tooltip"');
    expect(component).toContain("Faça login para baixar");
    expect(materialsPage).toContain('sessionStatus === "unauthenticated"');
    expect(materialDetail).toContain("!isAuthenticated");
  });
});
