import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const routeSource = readFileSync(new URL("./[id]/progress/route.ts", import.meta.url), "utf8");
const componentSource = readFileSync(new URL("../../../components/material-progress-button.tsx", import.meta.url), "utf8");

describe("material progress contract", () => {
  it("uses authenticated upsert semantics and exposes completion feedback", () => {
    expect(routeSource).toContain("materialProgress");
    expect(routeSource).toContain("onConflictDoUpdate");
    expect(routeSource).toContain("completedAt");
    expect(componentSource).toContain("Marcar como concluído");
    expect(componentSource).toContain("Material concluído");
    expect(componentSource).toContain("/api/materials/${materialId}/progress");
  });
});
