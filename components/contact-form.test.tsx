// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "./contact-form";

describe("ContactForm interaction", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows an accessible error when required fields are missing", () => {
    render(<ContactForm />);
    fireEvent.submit(screen.getByRole("button", { name: "Enviar mensagem" }).closest("form")!);

    expect(screen.getByRole("alert").textContent).toContain("Não foi possível preparar sua mensagem");
  });

  it("prefills the subject and message for a contextual course request", () => {
    render(
      <ContactForm
        courseContext={{
          courseId: 7,
          courseName: "Aulas presenciais de conversação",
          courseType: 5,
          initialSubject: "Agendamento de aula presencial",
          initialMessage: "Olá, Anderson. Tenho interesse em agendar uma aula presencial.",
        }}
      />,
    );

    expect(screen.getByRole("note").textContent).toContain("Aulas presenciais de conversação");
    expect((screen.getByLabelText(/Assunto/) as HTMLSelectElement).value).toBe("Agendamento de aula presencial");
    expect((screen.getByLabelText(/Mensagem/) as HTMLTextAreaElement).value).toBe("Olá, Anderson. Tenho interesse em agendar uma aula presencial.");
  });

  it("shows loading and submits valid data to the internal contact API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/Nome completo/), { target: { value: "Ana Silva" } });
    fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: "ana@example.com" } });
    fireEvent.change(screen.getByLabelText(/Assunto/), { target: { value: "Parceria" } });
    fireEvent.change(screen.getByLabelText(/Mensagem/), { target: { value: "Gostaria de conversar sobre uma parceria educacional." } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));

    expect(screen.getByRole("button", { name: /Preparando mensagem/ })).toHaveProperty("disabled", true);
    expect(screen.getByRole("status").textContent).toContain("central administrativa");

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/contact",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Ana Silva",
          email: "ana@example.com",
          subject: "Parceria",
          message: "Gostaria de conversar sobre uma parceria educacional.",
        }),
      }),
    ));
    expect(await screen.findByText(/Mensagem enviada com sucesso/)).toBeTruthy();
  });
});
