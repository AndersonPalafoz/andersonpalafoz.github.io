import { describe, expect, it } from "vitest";
import { CERTIFICATE_PRESETS } from "./certificate-presets";

describe("certificate DOCX presets", () => {
  const sample = ["Ana Souza", "123.456.789-00", "English B2", "40 horas", "julho de 2026"] as const;

  it("keeps the official platform preset branded", () => {
    const preset = CERTIFICATE_PRESETS.standard;
    expect(preset.showLogo).toBe(true);
    expect(preset.bodyTemplate(...sample)).toContain("Ana Souza");
    expect(preset.bodyTemplate(...sample)).toContain("English B2");
  });

  it("keeps the IsF preset independent from site branding", () => {
    const preset = CERTIFICATE_PRESETS.isf;
    expect(preset.showLogo).toBe(false);
    expect(preset.organization).toContain("REDE ANDIFES");
    expect(preset.bodyTemplate(...sample)).toContain("Rede Andifes Idiomas sem Fronteiras");
  });

  it("keeps the PROFICI preset independent from site branding", () => {
    const preset = CERTIFICATE_PRESETS.profici;
    expect(preset.showLogo).toBe(false);
    expect(preset.organization).toContain("PROFICI");
    expect(preset.bodyTemplate(...sample)).toContain("English B2");
  });
});
