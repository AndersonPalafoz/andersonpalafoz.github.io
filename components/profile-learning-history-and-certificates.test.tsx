import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const componentSource = readFileSync(new URL("./profile-learning-history-and-certificates.tsx", import.meta.url), "utf8");

describe("Profile Learning History & Certificates Component", () => {
  it("contém títulos e seções exigidas para histórico e certificados", () => {
    expect(componentSource).toContain("Histórico de Aprendizado");
    expect(componentSource).toContain("Certificados e Conquistas");
    expect(componentSource).toContain("/api/user/historico");
    expect(componentSource).toContain("/api/dashboard/certificados");
    expect(componentSource).toContain("Baixar PDF Assinado");
  });
});
