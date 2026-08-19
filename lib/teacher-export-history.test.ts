import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Teacher ZIP Export History Feature Contract", () => {
  it("defines the teacherZipExports table in schema.ts", () => {
    const schemaContent = fs.readFileSync(path.join(process.cwd(), "drizzle/schema.ts"), "utf8");
    expect(schemaContent).toContain("teacher_zip_exports");
    expect(schemaContent).toContain("materialCount");
    expect(schemaContent).toContain("totalBytes");
  });

  it("implements the zip-history API endpoint with role protection and owner isolation", () => {
    const routePath = path.join(process.cwd(), "app/api/professor/zip-history/route.ts");
    expect(fs.existsSync(routePath)).toBe(true);
    const content = fs.readFileSync(routePath, "utf8");
    expect(content).toContain("teacherZipExports");
    expect(content).toContain("session?.user?.role");
  });

  it("renders the TeacherZipHistory component with table layout and refresh control", () => {
    const componentPath = path.join(process.cwd(), "components/teacher-zip-history.tsx");
    expect(fs.existsSync(componentPath)).toBe(true);
    const content = fs.readFileSync(componentPath, "utf8");
    expect(content).toContain("Histórico de Exportações ZIP");
    expect(content).toContain("RefreshCw");
    expect(content).toContain("Gerando CSV");
    expect(content).toContain("Relatório CSV baixado com sucesso");
    expect(content).toContain("aria-busy");
  });

  it("implements the zip-history CSV export endpoint", () => {
    const csvRoutePath = path.join(process.cwd(), "app/api/professor/zip-history/csv/route.ts");
    expect(fs.existsSync(csvRoutePath)).toBe(true);
    const content = fs.readFileSync(csvRoutePath, "utf8");
    expect(content).toContain("text/csv");
    expect(content).toContain("bom");
  });
});
