export interface AcademicGradePoint {
  score: number | null;
  occurredAt: Date | string | null;
}

export interface AcademicAttendancePoint {
  status: string;
  occurredAt: Date | string | null;
}

export interface AcademicTimelinePoint {
  month: string;
  monthKey: string;
  averageGrade: number | null;
  attendanceRate: number | null;
}

function monthKey(date: Date | string | null) {
  if (!date) return null;
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return null;
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-");
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit", timeZone: "UTC" })
    .format(new Date(Date.UTC(Number(year), Number(month) - 1, 1)))
    .replace(".", "")
    .replace(" de ", " ");
}

export function buildAcademicTimeline(grades: AcademicGradePoint[], attendance: AcademicAttendancePoint[]): AcademicTimelinePoint[] {
  const seriesMap = new Map<string, { grades: number[]; present: number; total: number }>();
  for (const row of grades) {
    const key = monthKey(row.occurredAt);
    if (!key || row.score === null) continue;
    const current = seriesMap.get(key) || { grades: [], present: 0, total: 0 };
    current.grades.push(Number(row.score));
    seriesMap.set(key, current);
  }
  for (const row of attendance) {
    const key = monthKey(row.occurredAt);
    if (!key) continue;
    const current = seriesMap.get(key) || { grades: [], present: 0, total: 0 };
    current.total += 1;
    if (row.status === "present") current.present += 1;
    seriesMap.set(key, current);
  }

  return Array.from(seriesMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => ({
    month: monthLabel(key),
    monthKey: key,
    averageGrade: value.grades.length ? Math.round((value.grades.reduce((sum, score) => sum + score, 0) / value.grades.length) * 10) / 10 : null,
    attendanceRate: value.total ? Math.round((value.present / value.total) * 100) : null,
  }));
}
