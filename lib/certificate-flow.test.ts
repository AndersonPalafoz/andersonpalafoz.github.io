import { describe, expect, it } from "vitest";
import { CERTIFICATE_FLOW, getCertificateFlowCopy, resolveCertificateFlowStep } from "@/lib/certificate-flow";

describe("fluxo compartilhado de certificados", () => {
  it("mantém as etapas em uma sequência única", () => {
    expect(CERTIFICATE_FLOW.map(step => step.id)).toEqual(["create", "validate", "download"]);
  });

  it("considera o PDF emitido ou assinado como pronto para download", () => {
    expect(resolveCertificateFlowStep({ certificateCode: "AP-1" })).toBe("validate");
    expect(resolveCertificateFlowStep({ certificateUrl: "https://storage.example/certificate.pdf" })).toBe("download");
    expect(resolveCertificateFlowStep({ signedPdfUrl: "signed/certificate.pdf" })).toBe("download");
  });

  it("explica o papel de cada área sem ampliar permissões", () => {
    expect(getCertificateFlowCopy("admin")).toContain("Configure");
    expect(getCertificateFlowCopy("professor")).toContain("sob sua gestão");
    expect(getCertificateFlowCopy("student")).toContain("sua cópia");
  });
});
