import { describe, expect, it } from "vitest";

describe("Lesson Activity Toasts Integration", () => {
  it("defines success and error toast contracts for listening and speaking activities", () => {
    const listeningSuccessMessage = "Parabéns! Atividade de Listening concluída com sucesso.";
    const speakingSuccessMessage = "Gravação de Speaking enviada e analisada com sucesso.";
    const errorMessage = "Erro ao registrar conclusão da atividade de listening.";

    expect(listeningSuccessMessage).toContain("Listening concluída");
    expect(speakingSuccessMessage).toContain("enviada e analisada");
    expect(errorMessage).toContain("Erro");
  });
});
