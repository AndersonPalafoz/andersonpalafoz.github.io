export interface AttendanceExportRow {
  sessionTitle: string;
  scheduledAt: Date | string;
  courseTitle: string | null;
  studentName: string | null;
  studentEmail: string | null;
  status: string;
  notes: string | null;
}

function csvCell(value: string | number | null) {
  const safe = value === null ? "" : String(value);
  return `"${safe.replace(/"/g, '""')}"`;
}

export function attendanceStatusLabel(status: string) {
  if (status === "present") return "Presente";
  if (status === "absent") return "Ausente";
  if (status === "justified") return "Justificado";
  return status;
}

export function buildAttendanceCsv(rows: AttendanceExportRow[]) {
  const header = ["Sessão", "Data", "Curso", "Aluno", "E-mail", "Status", "Observações"];
  const lines = [header, ...rows.map((row) => [
    row.sessionTitle,
    new Date(row.scheduledAt).toLocaleString("pt-BR"),
    row.courseTitle,
    row.studentName,
    row.studentEmail,
    attendanceStatusLabel(row.status),
    row.notes,
  ])].map((line) => line.map((value) => csvCell(value)).join(";"));
  return "\uFEFF" + lines.join("\n");
}
