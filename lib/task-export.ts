export interface TaskExportRow {
  id: number;
  title: string;
  type: string;
  course: string;
  dueDate: string;
  status: string;
  tag: string;
}

export const TASK_EXPORT_HEADERS = ["ID", "Título", "Tipo", "Curso", "Prazo", "Status", "Etiqueta"] as const;

function escapeCsvValue(value: string | number) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function buildTasksCsv(rows: TaskExportRow[]) {
  const content = [
    TASK_EXPORT_HEADERS.map(escapeCsvValue).join(";"),
    ...rows.map((row) => [row.id, row.title, row.type, row.course, row.dueDate, row.status, row.tag].map(escapeCsvValue).join(";")),
  ].join("\r\n");

  return `\uFEFF${content}\r\n`;
}

export function getTasksExportFilename(format: "csv" | "pdf", context?: { offerId?: string | null; classId?: string | null }) {
  const scope = context?.offerId ? `oferta-${context.offerId}` : context?.classId ? `turma-${context.classId}` : "geral";
  return `relatorio-tarefas-${scope}.${format}`;
}
