import { describe, expect, it } from "vitest";
import { validateCertificateTemplate } from "@/lib/learning-storage";

describe("certificate template storage validation", () => {
  it("aceita PDF e PNG dentro do limite", () => {
    expect(
      validateCertificateTemplate({
        mimeType: "application/pdf",
        size: 1024,
        fileName: "modelo.pdf",
      }).valid
    ).toBe(true);
    expect(
      validateCertificateTemplate({
        mimeType: "image/png",
        size: 1024,
        fileName: "modelo.png",
      }).valid
    ).toBe(true);
  });

  it("rejeita formatos não suportados", () => {
    const result = validateCertificateTemplate({
      mimeType: "image/jpeg",
      size: 1024,
      fileName: "modelo.jpg",
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/PDF, PNG ou DOCX/);
  });

  it("rejeita arquivos acima de 10 MB", () => {
    const result = validateCertificateTemplate({
      mimeType: "application/pdf",
      size: 10 * 1024 * 1024 + 1,
      fileName: "modelo.pdf",
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/10 MB/);
  });
});
