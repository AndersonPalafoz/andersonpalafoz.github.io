import { describe, expect, it } from "vitest";
import { buildAssessmentImageHtml, validateAssessmentImage } from "@/lib/assessment-image";

describe("imagens de avaliações", () => {
  it("mantém a largura escolhida e limita a imagem ao editor", () => {
    const html = buildAssessmentImageHtml("https://storage.example/question.png", "50%");
    expect(html).toContain('src="https://storage.example/question.png"');
    expect(html).toContain("width: 50%");
    expect(html).toContain("max-width: 100%");
    expect(html).toContain('alt="Imagem da questão"');
  });

  it("escapa aspas no URL antes de inserir o HTML", () => {
    expect(buildAssessmentImageHtml('https://storage.example/"question.png', "30%")).toContain("&quot;");
  });

  it("aceita apenas formatos e tamanho pedagógico definidos", () => {
    expect(validateAssessmentImage("image/png", 1024)).toBeNull();
    expect(validateAssessmentImage("image/svg+xml", 1024)).toBeTruthy();
    expect(validateAssessmentImage("image/png", 6 * 1024 * 1024)).toBeTruthy();
  });
});
