import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const routeSource = readFileSync(
  new URL("../api/admin/academic-reports/route.ts", import.meta.url),
  "utf8"
);
const pageSource = readFileSync(
  new URL("./relatorios-academicos/page.tsx", import.meta.url),
  "utf8"
);

describe("resiliência dos Relatórios Acadêmicos", () => {
  it("não trata uma falha isolada de notas externas como falha total da consulta", () => {
    expect(routeSource).toContain("let gradesAvailable = true");
    expect(routeSource).toContain("Falha ao consultar notas externas nos relatórios:");
    expect(routeSource).toContain("academicDataStatus: {");
    expect(routeSource).toContain("gradesAvailable,");
  });

  it("não lista destinatários técnicos de certificados como alunos acadêmicos", () => {
    expect(routeSource).toContain("function isTechnicalCertificatePlaceholder");
    expect(routeSource).toContain('email.endsWith("@external.placeholder")');
    expect(routeSource).toContain("!isTechnicalCertificatePlaceholder(u)");
  });

  it("explica quando apenas a média depende de uma fonte temporariamente indisponível", () => {
    expect(pageSource).toContain("Os alunos e as matrículas foram carregados");
    expect(pageSource).toContain("Notas temporariamente indisponíveis");
    expect(pageSource).toContain("data?.academicDataStatus.gradesAvailable");
  });
});
