import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("importação de turmas externas IsF e PROFICI", () => {
  const page = readFileSync(join(process.cwd(), "app/professor/turmas-externas/page.tsx"), "utf8");
  const route = readFileSync(join(process.cwd(), "app/api/professor/external-classes/route.ts"), "utf8");
  const schema = readFileSync(join(process.cwd(), "drizzle/schema.ts"), "utf8");

  it("aceita arquivos CSV, TSV, XLS e XLSX e usa o parser de planilhas", () => {
    expect(page).toContain('import * as XLSX from "xlsx"');
    expect(page).toContain('XLSX.read(await file.arrayBuffer()');
    expect(page).toContain('accept=".csv,.tsv,.xls,.xlsx"');
  });

  it("mapeia os campos cadastrais dos layouts IsF e PROFICI", () => {
    for (const field of ["cpf", "category", "university", "component", "attendanceRecords", "classMetadata"]) {
      expect(page).toContain(field);
      expect(route).toContain(field);
    }
    expect(schema).toContain('category: varchar("category"');
    expect(schema).toContain('university: varchar("university"');
    expect(schema).toContain('component: varchar("component"');
  });

  it("normaliza e mescla presenças por data sem apagar lançamentos existentes", () => {
    expect(page).toContain("toIsoAttendanceDate");
    expect(page).toContain('attendanceRecords.push({ date: attendanceDate, status })');
    expect(route).toContain("attendanceByDate");
    expect(route).toContain("const mergedAttendance = { ...currentData, ...attendanceData }");
    expect(route).toContain('attendanceImportedCount');
  });
});
