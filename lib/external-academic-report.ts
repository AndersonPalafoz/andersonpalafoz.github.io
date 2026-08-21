export type AcademicReportFilter = "all" | "grade" | "attendance" | "any";

export const REPORT_MIN_GRADE = 6;
export const REPORT_MIN_ATTENDANCE = 75;

export type AcademicReportEligibility = {
  averageGrade: number | null;
  attendancePercent: number | null;
};

export const hasFailedByGrade = ({ averageGrade }: AcademicReportEligibility) => (
  averageGrade !== null && averageGrade < REPORT_MIN_GRADE
);

export const hasFailedByAttendance = ({ attendancePercent }: AcademicReportEligibility) => (
  attendancePercent !== null && attendancePercent < REPORT_MIN_ATTENDANCE
);

export const filterAcademicReportRows = <T extends AcademicReportEligibility>(
  rows: T[],
  filter: AcademicReportFilter,
) => {
  if (filter === "grade") return rows.filter(hasFailedByGrade);
  if (filter === "attendance") return rows.filter(hasFailedByAttendance);
  if (filter === "any") return rows.filter((row) => hasFailedByGrade(row) || hasFailedByAttendance(row));
  return rows;
};

export const academicReportFilterLabel = (filter: AcademicReportFilter) => {
  if (filter === "grade") return `Reprovados por nota (média < ${REPORT_MIN_GRADE.toFixed(1)})`;
  if (filter === "attendance") return `Reprovados por falta (frequência < ${REPORT_MIN_ATTENDANCE}%)`;
  if (filter === "any") return "Qualquer reprovação";
  return "Todos os alunos";
};
