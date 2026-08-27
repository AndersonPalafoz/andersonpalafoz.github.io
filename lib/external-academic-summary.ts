import { parseGradeNumber, type CourseGradeSummary } from "@/lib/course-grading";

export type AttendanceRecord = {
  date: string;
  attendanceData: string;
};

export type AttendanceSummary = {
  totalClasses: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  attendanceRate: number | null;
  absenceRate: number | null;
  periodStart: string | null;
  periodEnd: string | null;
};

export type AcademicStatus = "approved" | "pending" | "failed" | "incomplete";

export function summarizeStudentAttendance(records: readonly AttendanceRecord[], studentId: number, periodStart?: string | null, periodEnd?: string | null): AttendanceSummary {
  const filtered = records
    .filter((record) => (!periodStart || record.date >= periodStart) && (!periodEnd || record.date <= periodEnd))
    .sort((a, b) => a.date.localeCompare(b.date));
  let present = 0;
  let late = 0;
  let absent = 0;
  let excused = 0;
  for (const record of filtered) {
    try {
      const payload = JSON.parse(record.attendanceData) as Record<string, string>;
      const status = payload[String(studentId)];
      if (status === "present") present += 1;
      else if (status === "late") late += 1;
      else if (status === "absent") absent += 1;
      else if (status === "excused" || status === "justified") excused += 1;
    } catch {
      // Registros legados inválidos não entram no denominador para não distorcer a frequência.
    }
  }
  const totalClasses = present + late + absent + excused;
  const countedForPresence = present + late + absent;
  return {
    totalClasses,
    present,
    late,
    absent,
    excused,
    attendanceRate: countedForPresence ? Math.round(((present + late) / countedForPresence) * 1000) / 10 : null,
    absenceRate: countedForPresence ? Math.round((absent / countedForPresence) * 1000) / 10 : null,
    periodStart: filtered[0]?.date ?? null,
    periodEnd: filtered.length ? filtered[filtered.length - 1].date : null,
  };
}

export function getAcademicStatus(result: CourseGradeSummary, attendance: AttendanceSummary, maxAbsencePercent: number | null | undefined): AcademicStatus {
  const hasAttendance = attendance.totalClasses > 0;
  const attendanceFailed = hasAttendance && maxAbsencePercent !== null && maxAbsencePercent !== undefined && (attendance.absenceRate ?? 0) > maxAbsencePercent;
  if (attendanceFailed || result.passed === false) return "failed";
  if (result.passed === true && (!hasAttendance || !attendanceFailed)) return "approved";
  const hasGrades = result.units.some((unit) => unit.gradeCount > 0);
  return hasGrades || hasAttendance ? "pending" : "incomplete";
}

export function normalizeExternalGrade(score: unknown, maxScore: unknown): number | null {
  const scoreValue = parseGradeNumber(score);
  const maxValue = parseGradeNumber(maxScore);
  return scoreValue !== null && maxValue !== null && maxValue > 0 ? (scoreValue / maxValue) * 10 : null;
}

export function formatAcademicStatus(status: AcademicStatus): string {
  return { approved: "Aprovado", pending: "Em acompanhamento", failed: "Reprovado", incomplete: "Sem dados suficientes" }[status];
}
