import { describe, expect, it } from "vitest";
import { isTechnicalLearnerIdentity } from "./technical-identities";

describe("identidades técnicas em visões pedagógicas", () => {
  it("reconhece placeholders e registros de teste conhecidos", () => {
    expect(isTechnicalLearnerIdentity({ email: "nao-cadastrado-123@external.placeholder" })).toBe(true);
    expect(isTechnicalLearnerIdentity({ email: "andersonpalafozbackup@gmail.com" })).toBe(true);
    expect(isTechnicalLearnerIdentity({ name: "TESTE DOCX IsF - Anderson Palafoz" })).toBe(true);
  });

  it("preserva contas externas reais com e-mail identificável", () => {
    expect(isTechnicalLearnerIdentity({ name: "Ana Santos", email: "ana.santos@email.com" })).toBe(false);
  });
});
