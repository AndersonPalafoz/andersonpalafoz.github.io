export type CourseType = 1 | 2 | 3 | 4 | 5;

export type SyncModality = "none" | "online_individual" | "online_group" | "presencial";

export interface CourseTypeDefinition {
  id: CourseType;
  shortLabel: string;
  label: string;
  tag: string;
  description: string;
  className: string;
  accentClassName: string;
  requiresExternalUrl: boolean;
  supportsSync: boolean;
}

export const COURSE_TYPE_DEFINITIONS: Record<CourseType, CourseTypeDefinition> = {
  1: {
    id: 1,
    shortLabel: "EAD Fechado",
    label: "Cursos Fechados EAD (Gravados)",
    tag: "EAD Fechado",
    description: "Aulas e materiais prontos para estudo autônomo, sem encontros diretos com o professor.",
    className: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-200",
    accentClassName: "bg-blue-600",
    requiresExternalUrl: false,
    supportsSync: false,
  },
  2: {
    id: 2,
    shortLabel: "Híbrido",
    label: "Cursos Híbridos com Encontros",
    tag: "Híbrido / Encontros",
    description: "Conteúdo gravado combinado com encontros síncronos individuais ou em grupo.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200",
    accentClassName: "bg-emerald-600",
    requiresExternalUrl: false,
    supportsSync: true,
  },
  3: {
    id: 3,
    shortLabel: "Particular",
    label: "Cursos Particulares Personalizados",
    tag: "Particular Customizado",
    description: "Percurso pedagógico sob medida para uma necessidade individual ou de um grupo fechado.",
    className: "border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-900/70 dark:bg-purple-950/40 dark:text-purple-200",
    accentClassName: "bg-purple-600",
    requiresExternalUrl: false,
    supportsSync: true,
  },
  4: {
    id: 4,
    shortLabel: "Externo",
    label: "Cursos Externos / Corporativos",
    tag: "Externo / Corporativo",
    description: "Gestão acadêmica de turmas e alunos vinculados a uma instituição ou organização parceira.",
    className: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200",
    accentClassName: "bg-amber-500",
    requiresExternalUrl: false,
    supportsSync: true,
  },
  5: {
    id: 5,
    shortLabel: "Presencial",
    label: "Aulas Presenciais e Agendamento",
    tag: "Presencial & Agendamento",
    description: "Divulgação profissional e contato direto para organizar aulas presenciais.",
    className: "border-red-200 bg-red-50 text-red-800 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200",
    accentClassName: "bg-red-600",
    requiresExternalUrl: false,
    supportsSync: true,
  },
};

export const COURSE_TYPE_OPTIONS = Object.values(COURSE_TYPE_DEFINITIONS);

export function normalizeCourseType(value: unknown): CourseType {
  const parsed = Number(value);
  return parsed >= 1 && parsed <= 5 && Number.isInteger(parsed) ? (parsed as CourseType) : 1;
}

export function getCourseTypeDefinition(value: unknown): CourseTypeDefinition {
  return COURSE_TYPE_DEFINITIONS[normalizeCourseType(value)];
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateCourseTypeFields(input: {
  courseType: unknown;
  externalRedirectUrl?: string | null;
  syncModality?: string | null;
}): string | null {
  const courseType = normalizeCourseType(input.courseType);
  const externalRedirectUrl = input.externalRedirectUrl?.trim() || "";
  const syncModality = input.syncModality?.trim() || "none";

  if (externalRedirectUrl && !isValidHttpUrl(externalRedirectUrl)) {
    return "A URL externa deve começar com http:// ou https://.";
  }

  if (!["none", "online_individual", "online_group", "presencial"].includes(syncModality)) {
    return "A modalidade de atendimento selecionada não é válida.";
  }

  if (!COURSE_TYPE_DEFINITIONS[courseType].supportsSync && syncModality !== "none") {
    return "Cursos EAD fechados não possuem modalidade síncrona; selecione Sem encontros.";
  }

  return null;
}

export function getSyncModalityLabel(value: unknown): string {
  switch (value) {
    case "online_individual":
      return "Encontros online individuais";
    case "online_group":
      return "Encontros online em grupo";
    case "presencial":
      return "Encontros presenciais";
    default:
      return "Sem encontros síncronos";
  }
}
