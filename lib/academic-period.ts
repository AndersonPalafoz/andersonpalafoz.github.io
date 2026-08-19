export type AcademicPeriod = {
  year: number | null;
  semester: 1 | 2 | null;
};

const YEAR_PATTERN = /(?:^|[^\d])((?:19|20)\d{2})(?=[^\d]|$)/;
const YEAR_AND_SEMESTER_PATTERN = /(?:^|[^\d])((?:19|20)\d{2})\s*[./-]\s*([12])(?=$|[^\d])/;
const SEMESTER_BEFORE_NAME_PATTERN = /(?:^|[^\d])([12])\s*(?:º|°|o)?\s*(?:semestre|sem\.?|per[ií]odo)(?=$|[^a-z])/i;
const SEMESTER_AFTER_NAME_PATTERN = /(?:semestre|sem\.?|per[ií]odo)\s*([12])(?=$|[^\d])/i;

/**
 * Interpreta os formatos históricos aceitos pelo campo acadêmico livre.
 * Exemplos: 2026.1, 2026/2, 2026-1, "1º semestre de 2026".
 * Termos que não seguem um formato reconhecível continuam válidos no banco,
 * mas não são associados a um ano/semestre até serem normalizados.
 */
export function parseAcademicTerm(value: string | null | undefined): AcademicPeriod {
  const term = value?.trim() ?? "";
  if (!term) return { year: null, semester: null };

  const yearAndSemester = term.match(YEAR_AND_SEMESTER_PATTERN);
  const yearMatch = term.match(YEAR_PATTERN);
  const semesterMatch =
    term.match(SEMESTER_BEFORE_NAME_PATTERN) ?? term.match(SEMESTER_AFTER_NAME_PATTERN);

  const semesterValue = yearAndSemester?.[2] ?? semesterMatch?.[1];
  const semester = semesterValue === "1" || semesterValue === "2" ? (Number(semesterValue) as 1 | 2) : null;

  return {
    year: yearAndSemester?.[1] ? Number(yearAndSemester[1]) : yearMatch?.[1] ? Number(yearMatch[1]) : null,
    semester,
  };
}

export function formatSemester(semester: 1 | 2): string {
  return `${semester}º semestre`;
}
