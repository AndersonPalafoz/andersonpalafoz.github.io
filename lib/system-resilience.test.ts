import { describe, expect, it } from "vitest";
import { calculateStreakDays } from "./gamification";

describe("Resiliência Sistêmica e Correção de Erros de Runtime", () => {
  it("calcula streak com segurança mesmo recebendo valores nulos ou inválidos", () => {
    const streak = calculateStreakDays([null as any, undefined as any, new Date("invalid"), new Date()]);
    expect(typeof streak).toBe("number");
    expect(streak).toBeGreaterThanOrEqual(0);
  });
});
