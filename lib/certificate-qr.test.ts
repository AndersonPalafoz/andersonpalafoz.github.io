import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { getCertificateVerificationUrl, isCertificateCode } from "./certificate-qr";

describe("certificate verification QR contract", () => {
  it("builds an encoded public verification URL", () => {
    expect(getCertificateVerificationUrl("AP-CERT-5-23-ABC 123")).toBe(
      "https://andersonpalafoz.vercel.app/verificar/AP-CERT-5-23-ABC%20123",
    );
  });

  it("accepts only the institutional certificate code format", () => {
    expect(isCertificateCode("AP-CERT-5-23-ABC123")).toBe(true);
    expect(isCertificateCode("other-code")).toBe(false);
    expect(isCertificateCode(null)).toBe(false);
  });

  it("uses the QR contract in both official PDF generators and the completion endpoint", () => {
    const pdf = readFileSync(new URL("./certificate-pdf.ts", import.meta.url), "utf8");
    const jsPdf = readFileSync(new URL("./certificate-pdf-generator.ts", import.meta.url), "utf8");
    const completion = readFileSync(new URL("../app/api/lessons/[id]/progress/route.ts", import.meta.url), "utf8");
    expect(pdf).toContain("generateCertificateQrDataUrl");
    expect(pdf).toContain("pdf.embedPng(qrDataUrl)");
    expect(jsPdf).toContain("QRCode.toDataURL");
    expect(completion).toContain("issueCertificateIfEligible");
  });
});
