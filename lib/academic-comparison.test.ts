import { describe, expect, it } from "vitest";
import { mergeAcademicTimelines } from "@/lib/academic-comparison";

const point = (monthKey: string, averageGrade: number | null, attendanceRate: number | null) => ({
  month: monthKey.slice(5),
  monthKey,
  averageGrade,
  gradeCount: averageGrade === null ? 0 : 1,
  attendanceRate,
  attendancePresent: attendanceRate === null ? 0 : attendanceRate === 100 ? 1 : 0,
  attendanceTotal: attendanceRate === null ? 0 : 1,
});

describe("comparação acadêmica", () => {
  it("combina a série pessoal com a média real da turma por mês", () => {
    const result = mergeAcademicTimelines([point("2026-01", 80, 75)], [point("2026-01", 72, 80)]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ averageGrade: 80, classAverageGrade: 72, attendanceRate: 75, classAttendanceRate: 80 });
  });

  it("preserva meses que existem somente na turma para manter a referência temporal", () => {
    const result = mergeAcademicTimelines([point("2026-01", 80, null)], [point("2026-02", 70, 90)]);
    expect(result.map((item) => item.monthKey)).toEqual(["2026-01", "2026-02"]);
    expect(result[1].averageGrade).toBeNull();
    expect(result[1].classAverageGrade).toBe(70);
  });
});
