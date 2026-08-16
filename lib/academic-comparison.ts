import type { AcademicTimelinePoint } from "@/lib/academic-analytics";

export interface AcademicComparisonPoint extends AcademicTimelinePoint {
  classAverageGrade: number | null;
  classAttendanceRate: number | null;
}

export function mergeAcademicTimelines(studentTimeline: AcademicTimelinePoint[], classTimeline: AcademicTimelinePoint[]): AcademicComparisonPoint[] {
  const points = new Map<string, AcademicComparisonPoint>();
  for (const point of studentTimeline) points.set(point.monthKey, { ...point, classAverageGrade: null, classAttendanceRate: null });
  for (const point of classTimeline) {
    const current = points.get(point.monthKey) || { ...point, averageGrade: null, gradeCount: 0, attendanceRate: null, attendancePresent: 0, attendanceTotal: 0, classAverageGrade: null, classAttendanceRate: null };
    current.classAverageGrade = point.averageGrade;
    current.classAttendanceRate = point.attendanceRate;
    points.set(point.monthKey, current);
  }
  return Array.from(points.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
}
