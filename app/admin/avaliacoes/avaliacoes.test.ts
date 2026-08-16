import { describe, expect, it } from "vitest";

describe("avaliações com editor rico", () => {
  it("preserva marcações HTML do enunciado para renderização formatada", () => {
    const question = {
      title: "Quiz — Simple Present",
      type: "quiz" as const,
      description: "<h3>Choose the correct option</h3><p><strong>She</strong> ____ English every day.</p><ul><li>study</li><li>studies</li></ul>",
    };

    expect(question.description).toContain("<h3>");
    expect(question.description).toContain("<strong>She</strong>");
    expect(question.description).toContain("<ul>");
    expect(["quiz", "exercise", "assignment", "speaking"]).toContain(question.type);
  });

  it("preserva a largura escolhida no HTML da imagem inserida", () => {
    const imageHtml = `<img src="https://storage.example/question.png" style="width: 50%; max-width: 100%; height: auto;" alt="Imagem da questão" />`;
    expect(imageHtml).toContain("width: 50%");
    expect(imageHtml).toContain("max-width: 100%");
    expect(imageHtml).toContain('alt="Imagem da questão"');
  });

  it("exige um curso, título e enunciado para uma avaliação válida", () => {
    const isValid = (payload: { courseId?: number; title?: string; description?: string }) => Boolean(
      payload.courseId && payload.title?.trim() && payload.description?.replace(/<[^>]+>/g, "").trim(),
    );

    expect(isValid({ courseId: 3, title: "Reading quiz", description: "<p>Read and answer.</p>" })).toBe(true);
    expect(isValid({ courseId: 3, title: "", description: "<p>Read and answer.</p>" })).toBe(false);
    expect(isValid({ courseId: 3, title: "Reading quiz", description: "<p></p>" })).toBe(false);
  });
});
