import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const faqPage = readFileSync(new URL("./faq/page.tsx", import.meta.url), "utf8");
const privacyPage = readFileSync(new URL("./politica-privacidade/page.tsx", import.meta.url), "utf8");
const footer = readFileSync(new URL("../components/footer.tsx", import.meta.url), "utf8");

describe("public legal and support routes", () => {
  it("provides an FAQ page with questions and a contact CTA", () => {
    expect(faqPage).toContain('title: "Perguntas Frequentes | Anderson Palafoz"');
    expect(faqPage).toContain("Perguntas frequentes");
    expect(faqPage).toContain('href="/contato"');
    expect(faqPage).toContain("<details");
  });

  it("provides a privacy policy with a contact link", () => {
    expect(privacyPage).toContain('title: "Política de Privacidade | Anderson Palafoz"');
    expect(privacyPage).toContain("Política de Privacidade");
    expect(privacyPage).toContain('href="/contato"');
    expect(privacyPage).toContain("Dados de Identificação");
  });

  it("keeps footer links aligned with the public routes", () => {
    expect(footer).toContain('href="/faq"');
    expect(footer).toContain('href="/politica-privacidade"');
  });
});
