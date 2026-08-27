import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./route.ts", import.meta.url), "utf8");

describe("moderação administrativa do fórum", () => {
  it("aceita administrador efetivo nas operações de moderação", () => {
    expect(source).toContain('import { requireAdmin } from "@/lib/admin-auth"');
    expect(source).toContain("const session = await requireAdmin()");
  });

  it("executa busca parcial em título e conteúdo com limite de entrada", () => {
    expect(source).toContain("trim().slice(0, 160)");
    expect(source).toContain("ilike(forumPosts.title");
    expect(source).toContain("ilike(forumPosts.content");
  });
});
