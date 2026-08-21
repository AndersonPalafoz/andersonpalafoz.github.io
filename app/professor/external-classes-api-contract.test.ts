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
});
