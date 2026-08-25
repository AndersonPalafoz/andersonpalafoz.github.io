import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("integração dos pilotos de medalhas", () => {
  it("concede os pilotos nos fluxos de aula e speaking", () => {
    const lessonRoute = read("app/api/lessons/[id]/progress/route.ts");
    const speakingRoute = read("app/api/speaking/attempts/route.ts");
    expect(lessonRoute).toContain('medalCode: "primeiro-passo"');
    expect(lessonRoute).toContain('medalCode: "trilha-iniciada"');
    expect(speakingRoute).toContain('medalCode: "voz-em-pratica"');
    expect(lessonRoute).toContain("awardMedalIfEligible");
    expect(speakingRoute).toContain("awardMedalIfEligible");
  });

  it("exige justificativa nas concessões manuais", () => {
    const adminRoute = read("app/api/admin/medals/route.ts");
    expect(adminRoute).toContain("!notes");
    expect(adminRoute).toContain("justificativa");
  });

  it("permite criação administrativa com código validado e sem duplicidade", () => {
    const adminRoute = read("app/api/admin/medals/route.ts");
    expect(adminRoute).toContain('body.action === "create"');
    expect(adminRoute).toContain("^[a-z0-9]+(?:-[a-z0-9]+)*$");
    expect(adminRoute).toContain("Já existe uma medalha com este código.");
    expect(adminRoute).toContain('db.insert(medalsCatalog).values');
  });

  it("oferece concessão em lote com deduplicação e contagem de resultados", () => {
    const adminRoute = read("app/api/admin/medals/route.ts");
    expect(adminRoute).toContain('body.action === "grant-batch"');
    expect(adminRoute).toContain("new Set<number>(batchUserIds)");
    expect(adminRoute).toContain("awarded");
  });
});
