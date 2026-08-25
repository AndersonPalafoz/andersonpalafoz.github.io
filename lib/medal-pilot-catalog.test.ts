import { describe, expect, it } from "vitest";
import { getPilotMedal, isPilotMedalCode, PILOT_MEDALS } from "./medal-pilot-catalog";

describe("catálogo piloto de medalhas", () => {
  it("mantém o catálogo pedagógico autorizado", () => {
    expect(PILOT_MEDALS.map((medal) => medal.code)).toEqual([
      "primeiro-passo",
      "trilha-iniciada",
      "voz-em-pratica",
      "participacao-destacada",
      "constancia-na-trilha",
      "explorador-do-vocabulario",
      "mestre-da-gramatica",
      "voz-confiante",
      "escrita-em-destaque",
      "colaborador-da-turma",
    ]);
  });

  it("usa códigos únicos e requisitos verificáveis", () => {
    expect(new Set(PILOT_MEDALS.map((medal) => medal.code)).size).toBe(PILOT_MEDALS.length);
    for (const medal of PILOT_MEDALS) {
      expect(medal.title.length).toBeGreaterThan(0);
      expect(medal.description.length).toBeGreaterThan(0);
      expect(medal.requirement.length).toBeGreaterThan(0);
    }
  });

  it("resolve somente códigos cadastrados no piloto", () => {
    expect(isPilotMedalCode("voz-em-pratica")).toBe(true);
    expect(getPilotMedal("nao-existe")).toBeNull();
    expect(isPilotMedalCode("nao-existe")).toBe(false);
  });
});
