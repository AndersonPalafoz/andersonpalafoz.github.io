import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const componentSource = readFileSync(new URL("./certificate-share-button.tsx", import.meta.url), "utf8");
const profileSource = readFileSync(new URL("./profile-learning-history-and-certificates.tsx", import.meta.url), "utf8");
const certificatesPageSource = readFileSync(new URL("../app/dashboard/certificados/page.tsx", import.meta.url), "utf8");
const certificatesRouteSource = readFileSync(new URL("../app/api/user/certificates/route.ts", import.meta.url), "utf8");

 describe("compartilhamento de certificados no LinkedIn", () => {
  it("usa o endpoint oficial share-offsite com a URL do certificado codificada", () => {
    expect(componentSource).toContain("https://www.linkedin.com/sharing/share-offsite/?url=");
    expect(componentSource).toContain("encodeURIComponent(certificateUrl)");
    expect(componentSource).toContain("noopener noreferrer");
  });

  it("oferece feedback visual, nome acessível e integração nas duas áreas do aluno", () => {
    expect(componentSource).toContain("toast.success");
    expect(componentSource).toContain("aria-label");
    expect(profileSource).toContain("<CertificateShareButton");
    expect(certificatesPageSource).toContain("<CertificateShareButton");
  });

  it("lista apenas certificados do próprio usuário e não expõe o caminho privado do PDF", () => {
    expect(certificatesRouteSource).toContain("getServerSession");
    expect(certificatesRouteSource).toContain("getCertificates(user.id)");
    expect(certificatesRouteSource).toContain("hasSignedPdf: Boolean(certificate.signedPdfUrl)");
    expect(certificatesRouteSource).not.toContain("signedPdfUrl: certificate.signedPdfUrl");
  });
});
