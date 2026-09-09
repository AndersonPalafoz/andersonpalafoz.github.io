import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const routeSource = readFileSync(new URL("./route.ts", import.meta.url), "utf8");
const panelSource = readFileSync(new URL("../../../../components/internal-class-activities-panel.tsx", import.meta.url), "utf8");

describe("activity management contract", () => {
  it("requires teacher/admin authorization and course ownership", () => {
    expect(routeSource).toContain("getAccess(existing.courseId)");
    expect(routeSource).toContain('status: 403');
    expect(routeSource).toContain("course.instructor === teacher.name");
  });

  it("exposes edit and delete controls for class activities", () => {
    expect(panelSource).toContain("/api/admin/atividades");
    expect(panelSource).toContain('method: "PUT"');
    expect(panelSource).toContain('method: "DELETE"');
    expect(panelSource).toContain("dueDate");
    expect(panelSource).toContain("confirm");
  });
});

export {};
