import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { validateSignedCertificate } from "@/lib/learning-storage";

const adminRouteSource = readFileSync(new URL("../../api/admin/certificates/route.ts", import.meta.url), "utf8");
const downloadRouteSource = readFileSync(new URL("../../api/certificates/[id]/download/route.ts", import.meta.url), "utf8");

 describe("certificados assinados", () => {
  it("aceita PDF assinado dentro do limite de 5 MB", () => {
    expect(validateSignedCertificate({ mimeType: "application/pdf", size: 1024, fileName: "certificado.pdf" })).toEqual({ valid: true });
  });

  it("aceita PDF com MIME genérico quando a extensão confirma o formato", () => {
    expect(validateSignedCertificate({ mimeType: "application/octet-stream", size: 1024, fileName: "certificado-final.PDF" })).toEqual({ valid: true });
  });

  it("rejeita arquivo que não seja PDF", () => {
    const result = validateSignedCertificate({ mimeType: "image/png", size: 1024, fileName: "certificado.png" });
    expect(result.valid).toBe(false);
  });

  it("rejeita PDFs vazios ou maiores que 5 MB", () => {
    expect(validateSignedCertificate({ mimeType: "application/pdf", size: 0, fileName: "certificado.pdf" }).valid).toBe(false);
    expect(validateSignedCertificate({ mimeType: "application/pdf", size: 5 * 1024 * 1024 + 1, fileName: "certificado.pdf" }).valid).toBe(false);
  });

  it("protege o upload com autenticação, autoria do curso e bucket privado", () => {
    expect(adminRouteSource).toContain("requireTeacherOrAdmin");
    expect(adminRouteSource).toContain("canManageCourse");
    expect(adminRouteSource).toContain("uploadSignedCertificatePdf");
    expect(adminRouteSource).toContain("deleteCertificatePdfFiles");
    expect(adminRouteSource).toContain("signatureType");
  });

  it("só remove a versão anterior depois de persistir o novo PDF e reverte o upload se a persistência falhar", () => {
    expect(adminRouteSource).toContain(
      "const previousSignedPdfUrl = certificate.signedPdfUrl"
    );
    expect(adminRouteSource).toContain(
      "signedPdfUrl: uploaded.objectPath"
    );
    expect(adminRouteSource).toContain(
      "signedPdfUrl: previousSignedPdfUrl"
    );
    expect(adminRouteSource).toContain("const storageCleanup = previousSignedPdfUrl");
    expect(adminRouteSource).toContain("const uploadRollback = await deleteCertificatePdfFiles");
    expect(adminRouteSource.indexOf("const storageCleanup = previousSignedPdfUrl")).toBeGreaterThan(
      adminRouteSource.indexOf("const updated = await updateCertificateSignature")
    );
  });

  it("protege o download com sessão, proprietário ou gestor autorizado e URL assinada", () => {
    expect(downloadRouteSource).toContain("getServerSession");
    expect(downloadRouteSource).toContain("certificate.userId === currentUser.id");
    expect(downloadRouteSource).toContain("canManageCourse");
    expect(downloadRouteSource).toContain("createSignedCertificateUrl");
  });
});
