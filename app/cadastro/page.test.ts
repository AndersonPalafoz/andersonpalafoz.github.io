import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(resolve(process.cwd(), "app/cadastro/page.tsx"), "utf8");
const route = readFileSync(resolve(process.cwd(), "app/api/auth/register/route.ts"), "utf8");

describe("página de cadastro", () => {
  it("orienta o usuário nas etapas de criação e solicitação de acesso", () => {
    expect(page).toContain("Como funciona o cadastro");
    expect(page).toContain("Crie sua conta");
    expect(page).toContain("Solicite o acesso");
  });

  it("mantém campos rotulados, preenchimento assistido e requisitos de senha acessíveis", () => {
    expect(page).toContain('htmlFor="registration-name"');
    expect(page).toContain('autoComplete="new-password"');
    expect(page).toContain('aria-describedby="password-guidance"');
    expect(page).toContain('aria-live="polite"');
    expect(page).toContain("passwordChecks.number");
  });

  it("preserva a validação de senha e o acesso pendente no servidor", () => {
    expect(route).toContain("isPasswordAcceptable(password)");
    expect(route).toContain('approvalStatus: "pending"');
    expect(route).toContain('role: "user"');
  });
});
