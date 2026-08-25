import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const projectRoot = process.cwd();
const read = (relativePath: string) => readFileSync(join(projectRoot, relativePath), "utf8");

describe("moderação de comentários do blog", () => {
  it("oferece estados administrativos de visibilidade e exclusão lógica", () => {
    const route = read("app/api/admin/article-reviews/route.ts");
    expect(route).toContain('moderationStatus');
    expect(route).toContain('["hide", "restore", "delete"]');
    expect(route).toContain('moderationStatus = action === "hide" ? "hidden" : action === "delete" ? "deleted" : "visible"');
    expect(route).toContain('session?.user?.role === "admin"');
  });

  it("não publica comentários ocultos ou excluídos", () => {
    const database = read("lib/db.ts");
    expect(database).toContain('ne(schema.articleComments.moderationStatus, "hidden")');
    expect(database).toContain('ne(schema.articleComments.moderationStatus, "deleted")');
  });

  it("exige confirmação e oferece resposta oficial no painel", () => {
    const page = read("app/admin/reviews/page.tsx");
    expect(page).toContain("window.confirm");
    expect(page).toContain("Responder com Selo");
    expect(page).toContain("Comentário ocultado.");
  });
});
