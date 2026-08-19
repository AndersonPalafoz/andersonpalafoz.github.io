import { describe, expect, it } from "vitest";
import { describeHttpError } from "./error-codes";

describe("describeHttpError", () => {
  it.each([
    [400, "Erro 400: Requisição Inválida"],
    [401, "Erro 401: Não Autenticado"],
    [403, "Erro 403: Acesso Negado"],
    [404, "Erro 404: Não Encontrado"],
    [409, "Erro 409: Conflito de Dados"],
    [500, "Erro 500: Falha Interna no Servidor"],
  ])("descreve o status %s com título explícito", (status, title) => {
    const result = describeHttpError(status);
    expect(result.status).toBe(status);
    expect(result.title).toBe(title);
    expect(result.message.length).toBeGreaterThan(0);
    expect(result.actionHint.length).toBeGreaterThan(0);
  });

  it("preserva a mensagem retornada pela API", () => {
    const result = describeHttpError(403, "A turma pertence a outro professor.");
    expect(result.message).toBe("A turma pertence a outro professor.");
    expect(result.actionHint).toContain("administrador");
  });

  it("trata status desconhecido como falha interna sem ocultar o código", () => {
    const result = describeHttpError(502, "Gateway indisponível");
    expect(result.status).toBe(502);
    expect(result.title).toContain("502");
    expect(result.message).toBe("Gateway indisponível");
  });
});
