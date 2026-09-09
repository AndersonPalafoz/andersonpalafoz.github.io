export type ProgressEvidence = {
  totalLessons: number;
  completedLessons: number;
  totalActivities: number;
  completedActivities: number;
};

export type LearningProgress = ProgressEvidence & { percentage: number; hasEvidence: boolean };

export function shouldCelebrateProgress(previous: number | null, current: number, hasEvidence: boolean) {
  return previous !== null && hasEvidence && current > previous;
}

export function calculateInternalClassProgress(evidence: ProgressEvidence): LearningProgress {
  const totalItems = Math.max(0, evidence.totalLessons) + Math.max(0, evidence.totalActivities);
  const completedItems = Math.max(0, evidence.completedLessons) + Math.max(0, evidence.completedActivities);
  if (totalItems === 0) return { ...evidence, percentage: 0, hasEvidence: false };
  return { ...evidence, percentage: Math.min(100, Math.max(0, Math.round((completedItems / totalItems) * 100))), hasEvidence: true };
}
