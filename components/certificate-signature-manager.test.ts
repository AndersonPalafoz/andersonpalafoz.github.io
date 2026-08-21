import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("./certificate-signature-manager.tsx", import.meta.url),
  "utf8"
);

describe("gerenciador administrativo de certificados", () => {
  it("exibe badges claros para certificados com e sem a marca do site", () => {
    expect(source).toContain("Com marca do site");
    expect(source).toContain("Sem marca do site");
    expect(source).toContain("includeSiteBranding");
    expect(source).toContain("Modelo institucional");
    expect(source).toContain("Modelo da plataforma");
  });

  it("pesquisa por aluno, e-mail, curso ou código", () => {
    expect(source).toContain("Pesquisar Aluno/Curso");
    expect(source).toContain("studentEmail");
    expect(source).toContain("certificateCode");
    expect(source).toContain("searchQuery");
  });

  it("pagina resultados e reinicia a página ao trocar filtros", () => {
    expect(source).toContain("certificatesPerPage");
    expect(source).toContain("setCurrentPage(1)");
    expect(source).toContain("paginatedCertificates");
    expect(source).toContain("Página {currentPage} de {totalPages}");
    expect(source).toContain('aria-label="Paginação dos certificados"');
  });
});
