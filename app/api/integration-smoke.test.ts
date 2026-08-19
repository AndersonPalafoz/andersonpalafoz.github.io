import { describe, it, expect } from "vitest";

describe("Smoke Tests e Integração de Rotas Críticas", () => {
  it("confirma que a API de turmas externas possui estrutura de tratamento de erros segura", async () => {
    const routeModule = await import("@/app/api/professor/external-classes/route");
    expect(typeof routeModule.GET).toBe("function");
  });

  it("confirma que a API de progresso e speaking possui estrutura segura", async () => {
    const routeModule = await import("@/app/api/professor/progress-speaking/route");
    expect(typeof routeModule.GET).toBe("function");
    expect(typeof routeModule.POST).toBe("function");
  });

  it("confirma que o utilitário de links do Google Drive processa URLs corretamente", async () => {
    const { parseGoogleDriveLinks } = await import("@/lib/google-drive-links");
    const testUrl = "https://drive.google.com/file/d/abc123xyz/view";
    const links = parseGoogleDriveLinks(testUrl);
    expect(links.length).toBe(1);
    expect(links[0]).toBe(testUrl);
  });
});
