import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(join(process.cwd(), "app/professor/turmas-externas/page.tsx"), "utf8");

describe("validação em tempo real do formulário de turmas externas", () => {
  it("valida instituição, nomes, período letivo e descrição", () => {
    expect(source).toContain("validateClassForm");
    expect(source).toContain("pelo menos 3 caracteres");
    expect(source).toContain("2026.1 ou 2026.2");
    expect(source).toContain("1.000 caracteres");
    expect(source).toContain("Revise os campos destacados antes de salvar a turma.");
  });

  it("marca campos em tempo real e exibe estado válido ou erro", () => {
    expect(source).toContain("markClassFieldTouched");
    expect(source).toContain("Campo válido");
    expect(source).toContain('role="alert"');
    expect(source).toContain("aria-invalid");
    expect(source).toContain("aria-describedby");
  });

  it("impede envio inválido e oferece limite visível para descrição", () => {
    expect(source).toContain("classFormIsValid");
    expect(source).toContain("disabled={submitting ||");
    expect(source).toContain("maxLength={1000}");
    expect(source).toContain("/1000");
  });
});
