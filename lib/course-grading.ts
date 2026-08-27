export type GradingScope = "course" | "unit";

export type CourseGradingConfig = {
  hasUnits?: boolean | null;
  unitCount?: number | null;
  gradingScope?: string | null;
  passingAverage?: string | number | null;
  unitPassingAverages?: string | Record<string, string | number> | null;
};

export type GradeEntry = {
  score: string | number | null | undefined;
  unit?: number | string | null;
};

export type UnitGradeSummary = {
  unit: number;
  average: number | null;
  passingAverage: number;
  passed: boolean | null;
  gradeCount: number;
};

export type CourseGradeSummary = {
  average: number | null;
  passingAverage: number;
  scope: GradingScope;
  passed: boolean | null;
  units: UnitGradeSummary[];
};

export const DEFAULT_PASSING_AVERAGE = 6;

export function parseGradeNumber(value: unknown): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

/** Normaliza notas digitadas com vírgula ou ponto para persistência consistente. */
export function normalizeGradeInput(value: unknown): string | null {
  let raw = String(value ?? "").trim().replace(",", ".");
  if (raw.startsWith(".")) raw = `0${raw}`;
  if (!raw || !/^\d+(?:\.\d+)?$/.test(raw)) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? String(parsed) : null;
}

function asNumber(value: unknown): number | null {
  return parseGradeNumber(value);
}

export function normalizePassingAverage(value: unknown, fallback = DEFAULT_PASSING_AVERAGE): number {
  const parsed = asNumber(value);
  return parsed !== null && parsed >= 0 && parsed <= 10 ? parsed : fallback;
}

export function parseUnitPassingAverages(value: CourseGradingConfig["unitPassingAverages"]): Record<string, number> {
  let parsed: unknown = value;
  if (typeof value === "string") {
    try { parsed = JSON.parse(value); } catch { parsed = {}; }
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  return Object.fromEntries(Object.entries(parsed as Record<string, unknown>).map(([key, item]) => [key, normalizePassingAverage(item)]));
}

export function getPassingAverageForUnit(config: CourseGradingConfig, unit: number): number {
  const overrides = parseUnitPassingAverages(config.unitPassingAverages);
  return overrides[String(unit)] ?? normalizePassingAverage(config.passingAverage);
}

export function calculateCourseGrade(config: CourseGradingConfig, grades: readonly GradeEntry[]): CourseGradeSummary {
  const scope: GradingScope = config.gradingScope === "unit" && config.hasUnits ? "unit" : "course";
  const unitCount = config.hasUnits ? Math.max(1, Math.min(100, Math.floor(Number(config.unitCount) || 1))) : 1;
  const buckets = new Map<number, number[]>();
  for (const grade of grades) {
    const score = asNumber(grade.score);
    if (score === null) continue;
    const unit = Math.max(1, Math.min(unitCount, Math.floor(Number(grade.unit) || 1)));
    const current = buckets.get(unit) ?? [];
    current.push(score);
    buckets.set(unit, current);
  }
  const units = Array.from({ length: unitCount }, (_, index) => {
    const unit = index + 1;
    const values = buckets.get(unit) ?? [];
    const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
    const passingAverage = getPassingAverageForUnit(config, unit);
    return { unit, average: average === null ? null : Math.round(average * 10) / 10, passingAverage, passed: average === null ? null : average >= passingAverage, gradeCount: values.length };
  });
  const allScores = grades.map(grade => asNumber(grade.score)).filter((score): score is number => score !== null);
  const average = allScores.length ? Math.round((allScores.reduce((sum, value) => sum + value, 0) / allScores.length) * 10) / 10 : null;
  const passingAverage = normalizePassingAverage(config.passingAverage);
  const passed = scope === "unit"
    ? (units.every(unit => unit.average !== null) ? units.every(unit => unit.passed === true) : null)
    : (average === null ? null : average >= passingAverage);
  return { average, passingAverage, scope, passed, units };
}

export function serializeUnitPassingAverages(values: Record<number | string, number>): string | null {
  const normalized: Record<string, number> = {};
  for (const [unit, value] of Object.entries(values)) normalized[String(unit)] = normalizePassingAverage(value);
  return Object.keys(normalized).length ? JSON.stringify(normalized) : null;
}
