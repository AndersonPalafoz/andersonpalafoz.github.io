import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./route.ts", import.meta.url), "utf8");

describe("download unitário de certificados", () => {
  it("libera o mesmo endpoint para PDF oficial ou PDF assinado após a autorização", () => {
    expect(source).toContain("const downloadableUrl = certificate.signedPdfUrl || certificate.certificateUrl");
    expect(source).toContain("certificate.signedPdfUrl\n      ? await createSignedCertificateUrl");
    expect(source).toContain("certificate.certificateUrl!");
  });

  it("preserva a checagem de propriedade, gestão docente e administração global", () => {
    expect(source).toContain("const isOwner = certificate.userId === currentUser.id");
    expect(source).toContain("canManageCourse");
    expect(source).toContain("isGlobalAdmin");
  });
});
