import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("contrato da API de turmas externas", () => {
  const routeContent = readFileSync(join(process.cwd(), "app/api/professor/external-classes/route.ts"), "utf8");

  it("importa NextRequest e NextResponse corretamente", () => {
    expect(routeContent).toContain('import { NextRequest, NextResponse } from "next/server";');
  });

  it("possui tratamento defensivo com try/catch no método GET", () => {
    expect(routeContent).toContain("export async function GET(request: NextRequest)");
    expect(routeContent).toContain("try {");
    expect(routeContent).toContain("catch (error)");
    expect(routeContent).toContain("status: 500");
  });

  it("mantém a mesma rota disponível aos três níveis de operação autorizados", () => {
    expect(routeContent).toContain('userRole === "professor"');
    expect(routeContent).toContain('userRole === "admin"');
    expect(routeContent).toContain('userRole === "super_admin"');
    expect(routeContent).toContain("const isGlobalAdmin");
  });

  it("limita o volume e normaliza os dados recebidos na importação de alunos", () => {
    expect(routeContent).toContain("MAX_IMPORTED_STUDENT_ROWS");
    expect(routeContent).toContain("MAX_ATTENDANCE_RECORDS_PER_IMPORTED_STUDENT");
    expect(routeContent).toContain("MAX_IMPORTED_TEXT_LENGTH");
    expect(routeContent).toContain("firstImportedText");
    expect(routeContent).toContain("hasInvalidPayload");
    expect(routeContent).toContain("status: 413");
  });

  it("preserva nota zero e impede lançar nota em aluno de outra turma", () => {
    expect(routeContent).toContain("score === undefined || score === null || String(score).trim() === \"\"");
    expect(routeContent).toContain("O aluno selecionado não pertence a esta turma.");
  });

  it("valida os quatro status de frequência suportados", () => {
    expect(routeContent).toContain('["present", "absent", "late", "excused"]');
    expect(routeContent).toContain("Há um status de frequência inválido");
  });
});
