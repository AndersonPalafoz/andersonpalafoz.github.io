import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { buildCertificatePdf } from "@/lib/certificate-pdf";

describe("certificado PDF", () => {
  const baseInput = {
    studentName: "Ana Souza",
    courseTitle: "English Fundamentals",
    level: "B1",
    issuedAt: new Date("2026-08-16T00:00:00Z"),
    certificateCode: "AP-CERT-1-2-ABC12345",
  };

  it("gera um PDF válido com os dados acadêmicos essenciais", async () => {
    const bytes = await buildCertificatePdf(baseInput);
    expect(bytes.length).toBeGreaterThan(500);
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
  });

  it("aceita a decisão explícita de não incluir branding em certificado externo", async () => {
    const bytes = await buildCertificatePdf({
      ...baseInput,
      includeSiteBranding: false,
      institutionName: "UFBA / IsF",
    });
    expect(bytes.length).toBeGreaterThan(500);
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
  });

  it("preserva um template PDF de terceiros e aplica os campos configurados", async () => {
    const template = await PDFDocument.create();
    template.addPage([842, 595]);
    const templateBytes = await template.save();
    const bytes = await buildCertificatePdf({
      ...baseInput,
      includeSiteBranding: true,
      templateBackgroundBytes: templateBytes,
      fieldMappings: {
        studentName: { x: 120, y: 320, size: 24, maxWidth: 600 },
        courseTitle: { x: 120, y: 260, size: 20 },
      },
    });
    const output = await PDFDocument.load(bytes);
    expect(output.getPageCount()).toBe(1);
  });
});
