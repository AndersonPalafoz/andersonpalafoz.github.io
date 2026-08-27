type CourseIdentity = {
  title?: string | null;
  description?: string | null;
};

const TECHNICAL_COURSE_MARKERS = [
  "teste docx",
  "validação docx",
  "curso de validação",
  "módulo de teste",
];

/**
 * Identifica cursos técnicos criados apenas para validar documentos, modelos
 * ou fluxos internos. Eles permanecem disponíveis ao administrador, mas não
 * fazem parte do catálogo nem da experiência pedagógica de alunos/professores.
 */
export function isTechnicalCourse(course: CourseIdentity) {
  const searchableText = `${course.title ?? ""} ${course.description ?? ""}`.toLocaleLowerCase("pt-BR");
  return TECHNICAL_COURSE_MARKERS.some((marker) => searchableText.includes(marker));
}

export function isLearnerVisibleCourse(course: CourseIdentity) {
  return !isTechnicalCourse(course);
}
