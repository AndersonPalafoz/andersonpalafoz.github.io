import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(join(process.cwd(), "app/admin/usuarios/page.tsx"), "utf8");

describe("admin users destructive actions layout", () => {
  it("keeps the desktop table columns aligned with the rendered cells", () => {
    expect(source).toContain("<colgroup>");
    expect(source).toContain("<th className=\"px-3 py-4 font-semibold\">Cadastro</th>");
    expect(source).toContain("className=\"px-3 py-4 align-top\"");
  });

  it("exposes the permanent delete action with an accessible label on mobile and desktop", () => {
    expect(source).toContain("Excluir definitivamente");
    expect(source).toContain("definitivamente`}");
    expect(source).toContain("whitespace-normal");
  });
});
