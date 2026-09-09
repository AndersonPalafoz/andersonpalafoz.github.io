import { describe, expect, it } from "vitest";
import { buildTasksCsv, getTasksExportFilename } from "@/lib/task-export";

describe("task export utilities", () => {
  it("builds a UTF-8 CSV with headers, semicolon delimiters and escaped content", () => {
    const csv = buildTasksCsv([{
      id: 12,
      title: 'Reading; "Unit 1"',
      type: "assignment",
      course: "English A1",
      dueDate: "10/09/2026 18:00",
      status: "Pendente",
      tag: "Gramática",
    }]);

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"Título"');
    expect(csv).toContain('"Reading; ""Unit 1"""');
    expect(csv.split("\r\n")).toHaveLength(3);
  });

  it("includes the current offer or legacy class in the filename", () => {
    expect(getTasksExportFilename("csv", { offerId: "7" })).toBe("relatorio-tarefas-oferta-7.csv");
    expect(getTasksExportFilename("pdf", { classId: "11" })).toBe("relatorio-tarefas-turma-11.pdf");
    expect(getTasksExportFilename("csv")).toBe("relatorio-tarefas-geral.csv");
  });
});
