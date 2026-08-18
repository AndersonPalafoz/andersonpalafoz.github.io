export interface ClassroomCourseItem {
  id: string;
  name: string;
  section?: string | null;
  descriptionHeading?: string | null;
}

/**
 * Filtra cursos e turmas do Google Classroom para garantir que apenas
 * aqueles relacionados à plataforma (Anderson Palafoz, Inglês, Worksheets, Simal, UFBA, Megaworks)
 * sejam exibidos ou importados, economizando memória do banco e mantendo o foco acadêmico.
 */
export function filterPlatformClassroomCourses(courses: ClassroomCourseItem[]): ClassroomCourseItem[] {
  if (!Array.isArray(courses)) return [];
  const keywords = ["anderson", "palafoz", "inglês", "ingles", "english", "simal", "ufba", "megaworks", "básico", "intermediário", "avançado", "grammar", "speaking"];
  return courses.filter((course) => {
    const text = `${course.name || ""} ${course.section || ""} ${course.descriptionHeading || ""}`.toLowerCase();
    return keywords.some((kw) => text.includes(kw));
  });
}
