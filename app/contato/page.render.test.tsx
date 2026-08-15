import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement("a", { ...props, href }, children),
}));

import ContatoPage, { metadata } from "./page";
import { ContactForm } from "@/components/contact-form";

describe("ContatoPage server rendering", () => {
  it("renders the contact page with form, channels, FAQ and primary CTAs", () => {
    const markup = renderToStaticMarkup(React.createElement(ContatoPage));

    expect(markup).toContain("Fale com o");
    expect(markup).toContain("Anderson Palafoz");
    expect(markup).toContain('id="contact-name"');
    expect(markup).toContain('id="contact-email"');
    expect(markup).toContain('id="contact-subject"');
    expect(markup).toContain('id="contact-message"');
    expect(markup).toContain("palafozanderson@gmail.com");
    expect(markup).toContain("https://wa.me/5571991222257");
    expect(markup).toContain('href="#mensagem"');
    expect(markup).toContain('href="/aulas"');
    expect(markup).toContain("Perguntas frequentes");
  });

  it("exports the expected metadata at runtime", () => {
    expect(metadata.title).toBe("Contato | Anderson Palafoz");
    expect(metadata.description).toContain("dúvidas");
    expect(metadata.alternates?.canonical).toBe("/contato");
  });

  it("renders the contact form with associated labels and direct WhatsApp link", () => {
    const markup = renderToStaticMarkup(React.createElement(ContactForm));

    expect(markup).toContain('for="contact-name"');
    expect(markup).toContain('for="contact-email"');
    expect(markup).toContain('for="contact-subject"');
    expect(markup).toContain('for="contact-message"');
    expect(markup).toContain('href="https://wa.me/5571991222257"');
    expect(markup).toContain('type="submit"');
    expect(markup).toContain("Enviar por email");
  });
});
