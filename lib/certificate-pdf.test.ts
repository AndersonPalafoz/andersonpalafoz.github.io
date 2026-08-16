import { describe, expect, it } from "vitest";
import { buildCertificatePdf } from "@/lib/certificate-pdf";

describe("certificado PDF", () => {
  it("gera um PDF válido com os dados acadêmicos essenciais", async () => {
    const bytes = await buildCertificatePdf({
      studentName: "Ana Souza",
      courseTitle: "English Fundamentals",
      level: "B1",
      issuedAt: new Date("2026-08-16T00:00:00Z"),
      certificateCode: "AP-CERT-1-2-ABC12345",
    });
    expect(bytes.length).toBeGreaterThan(500);
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
  });
});
