export type AcademicReportFilter = "all" | "grade" | "attendance" | "any";

export const REPORT_MIN_GRADE = 6;
export const REPORT_MIN_ATTENDANCE = 75;
export const DEFAULT_MAX_ABSENCE_PERCENT = 25;

export type AcademicReportEligibility = {
  averageGrade: number | null;
  attendancePercent: number | null;
};

const clampPercentage = (value: number) => Math.max(0, Math.min(100, value));

export const normalizeAttendanceThreshold = (value: unknown, fallback = REPORT_MIN_ATTENDANCE) => {
  const parsed = Number(String(value ?? "").trim().replace(",", "."));
  return Number.isFinite(parsed) ? clampPercentage(parsed) : fallback;
};

export const getMinimumAttendanceFromMaxAbsence = (maxAbsencePercent: unknown) => {
  const maxAbsence = normalizeAttendanceThreshold(maxAbsencePercent, DEFAULT_MAX_ABSENCE_PERCENT);
  return Math.round((100 - maxAbsence) * 10) / 10;
};

export const getMaxAbsenceFromMinimumAttendance = (minimumAttendancePercent: unknown) => {
  const minimumAttendance = normalizeAttendanceThreshold(minimumAttendancePercent);
  return Math.round((100 - minimumAttendance) * 10) / 10;
};

export const hasFailedByGrade = ({ averageGrade }: AcademicReportEligibility, minimumGrade = REPORT_MIN_GRADE) => (
  averageGrade !== null && averageGrade < minimumGrade
);

export const hasFailedByAttendance = (
  { attendancePercent }: AcademicReportEligibility,
  minimumAttendance = REPORT_MIN_ATTENDANCE,
) => (
  attendancePercent !== null && attendancePercent < minimumAttendance
);

export const filterAcademicReportRows = <T extends AcademicReportEligibility>(
  rows: T[],
  filter: AcademicReportFilter,
  minimumGrade = REPORT_MIN_GRADE,
  minimumAttendance = REPORT_MIN_ATTENDANCE,
) => {
  if (filter === "grade") return rows.filter((row) => hasFailedByGrade(row, minimumGrade));
  if (filter === "attendance") return rows.filter((row) => hasFailedByAttendance(row, minimumAttendance));
  if (filter === "any") return rows.filter((row) => hasFailedByGrade(row, minimumGrade) || hasFailedByAttendance(row, minimumAttendance));
  return rows;
};

export const academicReportFilterLabel = (
  filter: AcademicReportFilter,
  minimumAttendance = REPORT_MIN_ATTENDANCE,
  minimumGrade = REPORT_MIN_GRADE,
) => {
  if (filter === "grade") return `Reprovados por nota (média < ${minimumGrade.toFixed(1)})`;
  if (filter === "attendance") return `Reprovados por falta (frequência < ${minimumAttendance.toFixed(1)}%)`;
  if (filter === "any") return "Qualquer reprovação";
  return "Todos os alunos";
};

export type AcademicReportSummary = {
  total: number;
  approved: number;
  failed: number;
  insufficientData: number;
  approvedPercent: number;
  failedPercent: number;
  insufficientDataPercent: number;
  failedByGrade: number;
  failedByAttendance: number;
};

export const summarizeAcademicReportRows = <T extends AcademicReportEligibility>(
  rows: T[],
  minimumGrade = REPORT_MIN_GRADE,
  minimumAttendance = REPORT_MIN_ATTENDANCE,
): AcademicReportSummary => {
  const failedByGrade = rows.filter((row) => hasFailedByGrade(row, minimumGrade)).length;
  const failedByAttendance = rows.filter((row) => hasFailedByAttendance(row, minimumAttendance)).length;
  const failed = rows.filter((row) => hasFailedByGrade(row, minimumGrade) || hasFailedByAttendance(row, minimumAttendance)).length;
  const insufficientData = rows.filter((row) => (
    !hasFailedByGrade(row, minimumGrade) &&
    !hasFailedByAttendance(row, minimumAttendance) &&
    (row.averageGrade === null || row.attendancePercent === null)
  )).length;
  const approved = rows.length - failed - insufficientData;
  const total = rows.length;
  const percent = (value: number) => total > 0 ? (value / total) * 100 : 0;

  return {
    total,
    approved,
    failed,
    insufficientData,
    approvedPercent: percent(approved),
    failedPercent: percent(failed),
    insufficientDataPercent: percent(insufficientData),
    failedByGrade,
    failedByAttendance,
  };
};
