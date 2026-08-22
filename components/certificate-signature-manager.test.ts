import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("./certificate-signature-manager.tsx", import.meta.url),
  "utf8"
);
const routeSource = readFileSync(
  new URL("../app/api/admin/certificates/route.ts", import.meta.url),
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
    expect(source).toContain("Pesquisar Aluno (Nome, CPF, E-mail)");
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

  it("oferece exclusão individual e em lote com confirmação", () => {
    expect(source).toContain("requestDelete([certificate.id])");
    expect(source).toContain("Excluir selecionados");
    expect(source).toContain("Sim, excluir definitivamente");
    expect(source).toContain("/api/admin/certificates?ids=");
    expect(source).toContain("setDeleteTarget(null)");
  });

  it("trata pessoas sem cadastro sem renderizar e-mail placeholder", () => {
    expect(source).toContain("Sem cadastro no site");
    expect(source).toContain("isManualEntry");
    expect(routeSource).toContain("export async function DELETE");
    expect(routeSource).toContain("inArray(certificates.id, existingIds)");
    expect(routeSource).toContain("@external.placeholder");
    expect(routeSource).toContain("studentEmail: getDisplayEmail(certificate.user)");
  });
});
