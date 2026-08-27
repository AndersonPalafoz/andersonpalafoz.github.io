import { describe, expect, it } from "vitest";
import { calculateCourseGrade } from "@/lib/course-grading";
import { getAcademicStatus, summarizeStudentAttendance } from "@/lib/external-academic-summary";

describe("external academic summary", () => {
  it("calcula frequência por período e não conta justificadas como falta", () => {
    const summary = summarizeStudentAttendance([
      { date: "2026-08-01", attendanceData: JSON.stringify({ "10": "present" }) },
      { date: "2026-08-08", attendanceData: JSON.stringify({ "10": "late" }) },
      { date: "2026-08-15", attendanceData: JSON.stringify({ "10": "absent" }) },
      { date: "2026-08-22", attendanceData: JSON.stringify({ "10": "excused" }) },
    ], 10, "2026-08-01", "2026-08-15");
    expect(summary.totalClasses).toBe(3);
    expect(summary.present).toBe(1);
    expect(summary.late).toBe(1);
    expect(summary.absent).toBe(1);
    expect(summary.excused).toBe(0);
    expect(summary.attendanceRate).toBe(66.7);
  });

  it("respeita o limite de faltas específico da turma", () => {
    const result = calculateCourseGrade({ hasUnits: false, passingAverage: "5" }, [{ score: 8 }]);
    const attendance = summarizeStudentAttendance([
      { date: "2026-08-01", attendanceData: JSON.stringify({ "10": "absent" }) },
      { date: "2026-08-08", attendanceData: JSON.stringify({ "10": "present" }) },
      { date: "2026-08-15", attendanceData: JSON.stringify({ "10": "present" }) },
      { date: "2026-08-22", attendanceData: JSON.stringify({ "10": "present" }) },
    ], 10);
    expect(getAcademicStatus(result, attendance, 25)).toBe("approved");
    expect(getAcademicStatus(result, attendance, 10)).toBe("failed");
  });

  it("marca o aluno como reprovado quando excede o limite de faltas", () => {
    const result = calculateCourseGrade({ hasUnits: false, passingAverage: "5" }, [{ score: 8 }]);
    const attendance = summarizeStudentAttendance([
      { date: "2026-08-01", attendanceData: JSON.stringify({ "10": "absent" }) },
      { date: "2026-08-08", attendanceData: JSON.stringify({ "10": "present" }) },
    ], 10);
    expect(getAcademicStatus(result, attendance, 25)).toBe("failed");
  });
});
