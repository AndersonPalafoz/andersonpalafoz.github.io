export type InterventionPriority = "ação agora" | "acompanhar";

export interface InterventionStudent {
  id: number;
  name?: string | null;
  email?: string | null;
}

export interface InterventionActivityProgress {
  id: number;
  userId: number;
  activityId: number;
  status: string;
  submittedAt?: Date | string | null;
  completedAt?: Date | string | null;
  teacherFeedback?: string | null;
  teacherAudioFeedbackUrl?: string | null;
  activity?: { title?: string | null; type?: string | null } | null;
}

export interface InterventionSpeakingAttempt {
  id: number;
  userId: number;
  activityId: number;
  attemptNumber: number;
  submittedAt?: Date | string | null;
}

export interface PedagogicalIntervention {
  id: string;
  priority: InterventionPriority;
  reason: string;
  actionLabel: string;
  studentId: number;
  studentName: string;
  activityProgressId: number;
  activityId: number;
  activityTitle: string;
  createdAt: string | null;
}

const toTime = (value?: Date | string | null) => value ? new Date(value).getTime() || 0 : 0;

/**
 * Produz lembretes a partir de evidências já registradas: submissão sem devolutiva
 * ou revisão explicitamente solicitada. A função não infere desempenho nem cria score.
 */
export function buildPedagogicalInterventions({
  students,
  activityProgress,
  speakingAttempts,
}: {
  students: InterventionStudent[];
  activityProgress: InterventionActivityProgress[];
  speakingAttempts: InterventionSpeakingAttempt[];
}): PedagogicalIntervention[] {
  const studentsById = new Map(students.map((student) => [student.id, student]));
  const scopedProgress = activityProgress.filter((progress) => studentsById.has(progress.userId));

  const queue: PedagogicalIntervention[] = scopedProgress.flatMap<PedagogicalIntervention>((progress) => {
    const student = studentsById.get(progress.userId);
    if (!student || progress.activity?.type !== "speaking") return [];

    const hasFeedback = Boolean(progress.teacherFeedback?.trim() || progress.teacherAudioFeedbackUrl);
    const hasAttempt = speakingAttempts.some((attempt) => attempt.userId === progress.userId && attempt.activityId === progress.activityId);
    const studentName = student.name?.trim() || student.email || `Aluno #${student.id}`;
    const activityTitle = progress.activity.title?.trim() || "Atividade de Speaking";
    const createdAt = progress.submittedAt ? new Date(progress.submittedAt).toISOString() : null;

    if (progress.status === "completed" && hasAttempt && !hasFeedback) {
      return [{
        id: `feedback-${progress.id}`,
        priority: "ação agora" as const,
        reason: "Gravação recebida e aguardando feedback docente.",
        actionLabel: "Avaliar gravação",
        studentId: student.id,
        studentName,
        activityProgressId: progress.id,
        activityId: progress.activityId,
        activityTitle,
        createdAt,
      }];
    }

    if (progress.status === "in_progress" && hasFeedback) {
      return [{
        id: `revision-${progress.id}`,
        priority: "acompanhar" as const,
        reason: "Nova tentativa orientada; aguarda o reenvio do estudante.",
        actionLabel: "Acompanhar orientação",
        studentId: student.id,
        studentName,
        activityProgressId: progress.id,
        activityId: progress.activityId,
        activityTitle,
        createdAt,
      }];
    }

    return [];
  });

  return queue.sort((first, second) => {
    const firstPriority = first.priority === "ação agora" ? 0 : 1;
    const secondPriority = second.priority === "ação agora" ? 0 : 1;
    if (firstPriority !== secondPriority) return firstPriority - secondPriority;
    return toTime(first.createdAt) - toTime(second.createdAt);
  });
}
