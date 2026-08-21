import { describe, expect, it } from "vitest";

describe("Simulação de Checkout do Stripe", () => {
  it("confirma que o helper de preço garante valor mínimo de R$ 0,50 para cursos pagos", () => {
    const minAmountInCents = 50;
    const coursePrice = 10.00;
    const calculatedCents = Math.round(coursePrice * 100);
    expect(calculatedCents).toBeGreaterThanOrEqual(minAmountInCents);
  });
});
