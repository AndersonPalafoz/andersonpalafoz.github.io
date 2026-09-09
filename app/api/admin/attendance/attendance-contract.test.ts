import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const routeSource = readFileSync(new URL("./route.ts", import.meta.url), "utf8");
const panelSource = readFileSync(new URL("../../../../components/internal-class-attendance-panel.tsx", import.meta.url), "utf8");

describe("attendance management contract", () => {
  it("keeps attendance mutations scoped to the internal class", () => {
    expect(routeSource).toContain('export async function PATCH');
    expect(routeSource).toContain('export async function DELETE');
    expect(routeSource).toContain("attendanceId?: number; sessionId?: number; offerId?: number");
    expect(routeSource).toContain("eq(classSessions.offerId, body.offerId)");
    expect(routeSource).toContain('"Sessão não encontrada nesta turma."');
  });

  it("exposes scoped edit and delete controls", () => {
    expect(panelSource).toContain("/api/admin/attendance");
    expect(panelSource).toContain('method: "PATCH"');
    expect(panelSource).toContain('method: "DELETE"');
    expect(panelSource).toContain("attendanceId");
    expect(panelSource).toContain("offerId");
  });
});

export {};
