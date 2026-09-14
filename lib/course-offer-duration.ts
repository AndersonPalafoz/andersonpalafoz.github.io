export const CALENDAR_PERIODS = ["monthly", "bimonthly", "quarterly", "semester", "annual"] as const;
export const LEGACY_DURATION_TYPES = ["semester", "annual", "workload", "custom"] as const;
export const DURATION_TYPES = ["calendar_period", "workload", ...LEGACY_DURATION_TYPES] as const;

export type CalendarPeriod = (typeof CALENDAR_PERIODS)[number];
export type CourseOfferDurationType = (typeof DURATION_TYPES)[number];

const CALENDAR_PERIOD_LABELS: Record<CalendarPeriod, string> = {
  monthly: "mensal",
  bimonthly: "bimestral",
  quarterly: "trimestral",
  semester: "semestral",
  annual: "anual",
};

const CALENDAR_PERIOD_MONTHS: Record<CalendarPeriod, number> = {
  monthly: 1,
  bimonthly: 2,
  quarterly: 3,
  semester: 6,
  annual: 12,
};

export function validateCourseOfferDuration(input: {
  durationType?: unknown;
  durationValue?: unknown;
  durationUnit?: unknown;
  workloadHours?: unknown;
}) {
  const durationType = String(input.durationType ?? "semester");
  const workloadHours = input.workloadHours === undefined || input.workloadHours === null || input.workloadHours === ""
    ? 40
    : Number(input.workloadHours);

  if (!Number.isInteger(workloadHours) || workloadHours < 1) {
    return { ok: false as const, error: "A carga horária deve ser um número inteiro a partir de 1 hora." };
  }

  if (!DURATION_TYPES.includes(durationType as CourseOfferDurationType)) {
    return { ok: false as const, error: "Selecione uma duração válida para a oferta." };
  }

  const durationValue = input.durationValue === undefined || input.durationValue === null || input.durationValue === ""
    ? durationType === "annual" ? 1 : durationType === "semester" ? 1 : durationType === "workload" ? workloadHours : undefined
    : Number(input.durationValue);

  if (durationType === "workload") {
    if (durationValue !== workloadHours) {
      return { ok: false as const, error: "A duração por carga horária deve coincidir com a carga horária informada." };
    }
    return { ok: true as const, durationType: "workload", durationValue: workloadHours, durationUnit: "hours", workloadHours };
  }

  const normalizedType = durationType === "calendar_period" ? String(input.durationUnit ?? "") : durationType;
  if (!CALENDAR_PERIODS.includes(normalizedType as CalendarPeriod) && !["custom"].includes(normalizedType)) {
    return { ok: false as const, error: "Selecione um período de calendário válido." };
  }
  if (!Number.isInteger(durationValue) || Number(durationValue) < 1) {
    return { ok: false as const, error: "A duração deve ser um número inteiro a partir de 1." };
  }

  if (durationType === "calendar_period") {
    const period = normalizedType as CalendarPeriod;
    return {
      ok: true as const,
      durationType: "calendar_period",
      durationValue,
      durationUnit: period,
      workloadHours,
    };
  }

  return {
    ok: true as const,
    durationType,
    durationValue,
    durationUnit: input.durationUnit ? String(input.durationUnit) : durationType === "annual" ? "year" : "semester",
    workloadHours,
  };
}

export function formatCourseOfferDuration(input: {
  durationType?: string | null;
  durationValue?: number | null;
  durationUnit?: string | null;
  workloadHours?: number | null;
  unitCount?: number | null;
}) {
  if (input.durationType === "workload") return `${input.workloadHours ?? input.durationValue ?? 0} horas`;
  if (input.durationType === "calendar_period" && CALENDAR_PERIODS.includes(input.durationUnit as CalendarPeriod)) {
    const period = input.durationUnit as CalendarPeriod;
    const value = input.durationValue ?? 1;
    if (period === "annual" && input.unitCount && input.unitCount > 1) return `${value === 1 ? "anual" : `${value} × anual`} · ${input.unitCount} unidades letivas`;
    return value === 1 ? CALENDAR_PERIOD_LABELS[period] : `${value} × ${CALENDAR_PERIOD_LABELS[period]}`;
  }
  if (input.durationType === "annual") return input.unitCount && input.unitCount > 1 ? `anual · ${input.unitCount} unidades letivas` : "anual";
  if (input.durationType === "semester") return "semestral";
  if (input.durationType === "custom") return `${input.durationValue ?? 0} ${input.durationUnit ?? "unidade(s)"}`;
  return "semestral";
}

export function getPeriodMonths(period: CalendarPeriod) {
  return CALENDAR_PERIOD_MONTHS[period];
}

export function isCalendarPeriod(value: unknown): value is CalendarPeriod {
  return CALENDAR_PERIODS.includes(value as CalendarPeriod);
}
