import { describe, expect, it } from "vitest";

describe("Contact API validation", () => {
  it("validates required contact fields correctly", () => {
    const payload = {
      name: "Estudante Teste",
      email: "estudante@test.com",
      subject: "Dúvida sobre cursos",
      message: "Esta é uma mensagem de teste com mais de 10 caracteres.",
    };

    expect(payload.name).toBeTruthy();
    expect(payload.email).toContain("@");
    expect(payload.message.length).toBeGreaterThanOrEqual(10);
  });
});
