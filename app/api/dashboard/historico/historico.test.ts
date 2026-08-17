import { describe, it, expect } from "vitest";
import { buildAcademicTimeline } from "@/lib/academic-analytics";
import { mergeAcademicTimelines } from "@/lib/academic-comparison";

describe("Academic History Analytics & Timeline", () => {
  it("builds academic timeline correctly from grades and attendance", () => {
    const timeline = buildAcademicTimeline(
      [
        { score: 9.5, occurredAt: "2026-06-01T10:00:00.000Z" },
        { score: 8.0, occurredAt: "2026-06-15T10:00:00.000Z" },
      ],
      [
        { status: "present", occurredAt: "2026-06-01T10:00:00.000Z" },
        { status: "absent", occurredAt: "2026-06-10T10:00:00.000Z" },
      ]
    );

    expect(timeline).toHaveLength(1);
    expect(timeline[0].monthKey).toBe("2026-06");
    expect(timeline[0].averageGrade).toBe(8.8);
    expect(timeline[0].gradeCount).toBe(2);
    expect(timeline[0].attendanceRate).toBe(50);
  });

  it("merges student and class timelines correctly", () => {
    const student = [
      { month: "jun 26", monthKey: "2026-06", averageGrade: 9.0, gradeCount: 1, attendanceRate: 100, attendancePresent: 1, attendanceTotal: 1 }
    ];
    const cls = [
      { month: "jun 26", monthKey: "2026-06", averageGrade: 8.0, gradeCount: 5, attendanceRate: 85, attendancePresent: 17, attendanceTotal: 20 }
    ];

    const merged = mergeAcademicTimelines(student, cls);
    expect(merged).toHaveLength(1);
    expect(merged[0].averageGrade).toBe(9.0);
    expect(merged[0].classAverageGrade).toBe(8.0);
    expect(merged[0].attendanceRate).toBe(100);
    expect(merged[0].classAttendanceRate).toBe(85);
  });
});
