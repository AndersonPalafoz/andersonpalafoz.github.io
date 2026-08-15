// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "./contact-form";

describe("ContactForm interaction", () => {
  afterEach(() => {
    cleanup();
  });
  it("shows an accessible error when required fields are missing", () => {
    const onMailto = vi.fn();
    render(<ContactForm onMailto={onMailto} />);

    const form = screen.getByRole("button", { name: "Enviar por email" }).closest("form");
    fireEvent.submit(form!);

    expect(screen.getByRole("alert").textContent).toContain("Não foi possível preparar sua mensagem");
    expect(onMailto).not.toHaveBeenCalled();
  });

  it("shows loading while preparing and then submits valid data with success feedback", async () => {
    const onMailto = vi.fn();
    render(<ContactForm onMailto={onMailto} />);

    fireEvent.change(screen.getByLabelText(/Nome completo/), {
      target: { value: "Ana Silva" },
    });
    fireEvent.change(screen.getByLabelText(/^Email/), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Assunto/), {
      target: { value: "Parceria" },
    });
    fireEvent.change(screen.getByLabelText(/Mensagem/), {
      target: { value: "Gostaria de conversar sobre uma parceria educacional." },
    });

    const form = screen.getByRole("button", { name: "Enviar por email" }).closest("form");
    fireEvent.submit(form!);

    const loadingButton = screen.getByRole("button", { name: /Preparando mensagem/ });
    expect(loadingButton.hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("status").textContent).toContain("Preparando sua mensagem");

    await waitFor(() => expect(onMailto).toHaveBeenCalledTimes(1));
    expect(onMailto.mock.calls[0][0]).toContain("mailto:palafozanderson@gmail.com");
    expect(onMailto.mock.calls[0][0]).toContain("Parceria");
    expect(screen.getByRole("status").textContent).toContain("Mensagem preparada com sucesso");
  });
});
