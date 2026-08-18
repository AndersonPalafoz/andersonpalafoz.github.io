/**
 * Trilha de revisão baseada exclusivamente em registros acadêmicos persistidos.
 * Nenhuma recomendação é criada quando não há atividade ou nota suficiente para
 * justificar a sugestão.
 */

export interface AdaptiveInput {
  activityId: number;
  courseId: number;
  activityTitle: string;
  activityDescription?: string | null;
  courseTitle?: string | null;
  courseLevel?: string | null;
  score?: number | null;
  status?: string | null;
}

export interface AdaptiveRecommendation {
  id: string;
  topic: string;
  reason: string;
  suggestedAction: string;
  targetUrl: string;
  priority: "high" | "medium";
  level?: string | null;
  sourceActivityId: number;
  sourceScore?: number | null;
}

export function getAdaptiveRecommendations(userProgress: AdaptiveInput[]): AdaptiveRecommendation[] {
  return userProgress
    .filter((item) => (item.score !== null && item.score !== undefined && item.score < 70) || item.status === "pending" || item.status === "in_progress")
    .sort((a, b) => {
      const scoreA = a.score ?? 0;
      const scoreB = b.score ?? 0;
      return scoreA - scoreB;
    })
    .slice(0, 12)
    .map((item) => {
      const hasLowScore = item.score !== null && item.score !== undefined && item.score < 70;
      const reason = hasLowScore
        ? `A nota registrada nesta atividade foi ${item.score}%.`
        : `A atividade está registrada como ${item.status === "in_progress" ? "em andamento" : "pendente"}.`;
      return {
        id: `activity-${item.activityId}`,
        topic: item.activityTitle,
        reason: `${reason}${item.courseTitle ? ` Curso: ${item.courseTitle}.` : ""}`,
        suggestedAction: item.activityDescription?.trim() || "Abrir o curso e revisar esta atividade.",
        targetUrl: `/cursos/${item.courseId}`,
        priority: hasLowScore && (item.score ?? 0) < 50 ? "high" : "medium",
        level: item.courseLevel,
        sourceActivityId: item.activityId,
        sourceScore: item.score,
      };
    });
}
