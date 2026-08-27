import { calculateCourseGrade, type CourseGradeSummary, type CourseGradingConfig, type GradeEntry } from "@/lib/course-grading";
import { calculateSimalComposite, type SimalCompositeGrade, type SimalGradeInput } from "@/lib/simal-grading";

export type AcademicGradingPolicy = "standard" | "unit" | "simal";
export type AcademicStatus = "approved" | "failed" | "pending";

export type AttendanceSummaryInput = {
  present?: number;
  late?: number;
  absent?: number;
  excused?: number;
  total?: number;
  maxAbsencePercent?: number | null;
};

export type AcademicOutcome = {
  policy: AcademicGradingPolicy;
  status: AcademicStatus;
  average: number | null;
  attendanceRate: number | null;
  absencePercent: number | null;
  grade: CourseGradeSummary | null;
  simal: SimalCompositeGrade | null;
};

function calculateAttendance(summary?: AttendanceSummaryInput | null) {
  if (!summary || summary.total === undefined || summary.total <= 0) {
    return { attendanceRate: null, absencePercent: null, belowLimit: false };
  }
  const total = Math.max(0, summary.total);
  const absent = Math.max(0, summary.absent ?? 0);
  const attendanceRate = Math.round(((total - absent) / total) * 1000) / 10;
  const absencePercent = Math.round((absent / total) * 1000) / 10;
  const maxAbsencePercent = summary.maxAbsencePercent ?? 25;
  return { attendanceRate, absencePercent, belowLimit: absencePercent > maxAbsencePercent };
}

export function calculateAcademicOutcome({
  policy = "standard",
  gradingConfig,
  grades = [],
  simalGrades = [],
  attendance,
}: {
  policy?: AcademicGradingPolicy;
  gradingConfig?: CourseGradingConfig;
  grades?: readonly GradeEntry[];
  simalGrades?: readonly SimalGradeInput[];
  attendance?: AttendanceSummaryInput | null;
}): AcademicOutcome {
  const attendanceResult = calculateAttendance(attendance);
  const simal = policy === "simal" ? calculateSimalComposite(simalGrades) : null;
  const grade = policy === "simal" ? null : calculateCourseGrade(gradingConfig ?? {}, grades);
  const average = policy === "simal" ? simal?.finalScore ?? null : grade?.average ?? null;
  const gradeStatus: AcademicStatus = policy === "simal"
    ? simal?.complete ? (simal.finalScore !== null && simal.finalScore >= 6 ? "approved" : "failed") : "pending"
    : grade?.passed === true ? "approved" : grade?.passed === false ? "failed" : "pending";
  const status: AcademicStatus = attendanceResult.belowLimit ? "failed" : gradeStatus;
  return {
    policy,
    status,
    average,
    attendanceRate: attendanceResult.attendanceRate,
    absencePercent: attendanceResult.absencePercent,
    grade,
    simal,
  };
}
