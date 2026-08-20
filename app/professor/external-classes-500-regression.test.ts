import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Regressão da API de turmas externas", () => {
  const routeSource = readFileSync(resolve(process.cwd(), "app/api/professor/external-classes/route.ts"), "utf8");

  it("mantém as importações necessárias do App Router", () => {
    expect(routeSource).toContain('import { NextRequest, NextResponse } from "next/server";');
    expect(routeSource).toContain("export async function GET(request: NextRequest)");
    expect(routeSource).toContain("export async function POST(request: NextRequest)");
  });

  it("carrega a chamada antes de serializar cada turma", () => {
    expect(routeSource).toContain("const attendance = await db.select().from(externalClassAttendance)");
    expect(routeSource).toContain("attendance,");
  });

  it("preserva resposta JSON de erro para falhas de consulta", () => {
    expect(routeSource).toContain('return NextResponse.json({ error: "Erro interno ao buscar turmas externas." }, { status: 500 });');
  });
});
