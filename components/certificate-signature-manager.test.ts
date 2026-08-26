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
const certificateCompatibilityMigration = readFileSync(
  new URL("../drizzle/migrations/0075_certificate_external_recipient_compatibility.sql", import.meta.url),
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

  it("permite editar nome, curso, nível e CPF somente na prévia", () => {
    expect(source).toContain("customLevel");
    expect(source).toContain("customCpf");
    expect(source).toContain("studentLevel: levelVal");
    expect(source).toContain("studentCpf: cpfVal");
    expect(source).toContain("Regenerar Prévia");
  });

  it("trata pessoas sem cadastro sem renderizar e-mail placeholder", () => {
    expect(source).toContain("Sem cadastro no site");
    expect(source).toContain("isManualEntry");
    expect(routeSource).toContain("export async function DELETE");
    expect(routeSource).toContain("inArray(certificates.id, existingIds)");
    expect(routeSource).toContain("recipientName");
    expect(routeSource).toContain("studentEmail: certificate.recipientEmail || getDisplayEmail(certificate.user)");
    expect(routeSource).toContain("isManualExternalUser");
  });

  it("preserva a migração de compatibilidade para destinatários externos", () => {
    expect(certificateCompatibilityMigration).toContain('"recipientName"');
    expect(certificateCompatibilityMigration).toContain('"recipientEmail"');
    expect(certificateCompatibilityMigration).toContain('"recipientCpf"');
    expect(certificateCompatibilityMigration).toContain('ALTER COLUMN "userId" DROP NOT NULL');
  });
});
