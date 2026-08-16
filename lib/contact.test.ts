import { describe, expect, it } from "vitest";
import {
  buildContactMailto,
  CONTACT_EMAIL,
  CONTACT_LOCATION_URL,
  CONTACT_WHATSAPP_URL,
} from "./contact";

describe("contact utilities", () => {
  it("keeps the official contact channels configured", () => {
    expect(CONTACT_EMAIL).toBe("palafozanderson@gmail.com");
    expect(CONTACT_WHATSAPP_URL).toBe("https://wa.me/5571991222257");
    expect(CONTACT_LOCATION_URL).toContain("google.com/maps/search");
  });

  it("builds an encoded mailto with the sender details and message", () => {
    const mailto = buildContactMailto({
      name: "  Ana Silva ",
      email: " ana@example.com ",
      subject: "Dúvida sobre cursos",
      message: "Gostaria de saber mais sobre as aulas.",
    });
    const url = new URL(mailto);

    expect(url.protocol).toBe("mailto:");
    expect(url.pathname).toBe(CONTACT_EMAIL);
    expect(url.searchParams.get("subject")).toBe("[Contato] Dúvida sobre cursos");
    expect(url.searchParams.get("body")).toContain("Nome: Ana Silva");
    expect(url.searchParams.get("body")).toContain("Email: ana@example.com");
    expect(url.searchParams.get("body")).toContain("Gostaria de saber mais sobre as aulas.");
  });
});
