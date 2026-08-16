import { describe, expect, it } from "vitest";
import { getStripeOrigin } from "./stripe";

describe("stripe helpers", () => {
  it("prefere a origem da requisição para retornar ao ambiente atual", () => {
    const request = new Request("https://preview.example.com/cursos/1", { headers: { origin: "https://preview.example.com" } });
    expect(getStripeOrigin(request)).toBe("https://preview.example.com");
  });

  it("usa o fallback configurado quando a origem não está disponível", () => {
    const previous = process.env.NEXTAUTH_URL;
    process.env.NEXTAUTH_URL = "https://andersonpalafoz.com.br";
    expect(getStripeOrigin(new Request("http://localhost:3000"))).toBe("https://andersonpalafoz.com.br");
    if (previous === undefined) delete process.env.NEXTAUTH_URL;
    else process.env.NEXTAUTH_URL = previous;
  });
});
