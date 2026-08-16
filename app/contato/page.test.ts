import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
const formSource = readFileSync(
  new URL("../../components/contact-form.tsx", import.meta.url),
  "utf8",
);

describe("contact page contract", () => {
  it("keeps the public metadata and primary navigation destinations", () => {
    expect(pageSource).toContain('title: "Contato | Anderson Palafoz"');
    expect(pageSource).toContain('canonical: "/contato"');
    expect(pageSource).toContain('href="#mensagem"');
    expect(pageSource).toContain('href="/aulas"');
    expect(pageSource).toContain('id="faq"');
    expect(pageSource).toContain("Encontre respostas rápidas antes de enviar sua mensagem.");
  });

  it("exposes the official contact channels as accessible links", () => {
    expect(pageSource).toContain("CONTACT_EMAIL");
    expect(pageSource).toContain("CONTACT_WHATSAPP_URL");
    expect(pageSource).toContain("CONTACT_LOCATION_URL");
    expect(pageSource).toContain("target=\"_blank\"");
    expect(pageSource).toContain("rel=\"noopener noreferrer\"");
  });

  it("keeps FAQ items keyboard-friendly with native details disclosure", () => {
    expect(pageSource).toContain("<details");
    expect(pageSource).toContain("<summary");
    expect(pageSource).toContain("Perguntas frequentes");
  });

  it("keeps form fields associated with labels and required validation", () => {
    for (const fieldId of ["contact-name", "contact-email", "contact-subject", "contact-message"]) {
      expect(formSource).toContain(`htmlFor=\"${fieldId}\"`);
      expect(formSource).toContain(`id=\"${fieldId}\"`);
      expect(formSource).toContain("required");
    }
    expect(formSource).toContain('name="name"');
    expect(formSource).toContain('name="email"');
    expect(formSource).toContain('name="subject"');
    expect(formSource).toContain('name="message"');
  });

  it("keeps success and error feedback connected to the form state", () => {
    expect(formSource).toContain('role="status"');
    expect(formSource).toContain('role="alert"');
    expect(formSource).toContain("buildContactMailto");
    expect(formSource).toContain('type="submit"');
  });
});
