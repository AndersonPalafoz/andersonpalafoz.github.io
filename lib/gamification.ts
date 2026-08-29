import { sql, and, eq, gte, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { lessonProgress, userActivityProgress, userGamificationPoints } from "@/drizzle/schema";
import { awardMedalIfEligible } from "@/lib/medal-awards";

export const LESSON_COMPLETION_XP = 10;
export const ACTIVITY_COMPLETION_XP = 10;

const STREAK_BONUSES = new Map<number, number>([
  [7, 50],
  [14, 100],
  [30, 250],
  [60, 500],
  [100, 1000],
]);

const STREAK_MILESTONES = [...STREAK_BONUSES.keys()].sort((a, b) => a - b);

/**
 * Faixas de nível por pontos acumulados, no estilo CEFR usado no restante da
 * plataforma. Os limites são deliberadamente amplos no início (onde XP por
 * aula/atividade domina) e mais espaçados depois (onde bônus de sequência
 * passam a pesar mais).
 */
const LEVEL_TIERS: ReadonlyArray<{ minPoints: number; level: string }> = [
  { minPoints: 3000, level: "Master (C2)" },
  { minPoints: 1500, level: "Advanced (C1)" },
  { minPoints: 700, level: "Upper Intermediate (B2)" },
  { minPoints: 300, level: "Intermediate (B1)" },
  { minPoints: 100, level: "Beginner (A2)" },
  { minPoints: 0, level: "Explorer (A1)" },
];

export function computeLevelForPoints(points: number): string {
  const tier = LEVEL_TIERS.find((t) => points >= t.minPoints);
  return tier?.level ?? "Explorer (A1)";
}

const LOOKBACK_DAYS = 365;

function utcDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function shiftUtcDate(date: Date, days: number) {
  const shifted = new Date(date);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted;
}

export function calculateStreakDays(activityDates: readonly (Date | null | undefined)[], today = new Date()) {
  const validDates = (activityDates || []).filter((d): d is Date => d instanceof Date && !isNaN(d.getTime()));
  const dateKeys = new Set(validDates.map(utcDateKey));
  const currentDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  let streak = 0;
  let cursor = currentDay;

  while (dateKeys.has(utcDateKey(cursor))) {
    streak += 1;
    cursor = shiftUtcDate(cursor, -1);
  }

  return streak;
}

export function getStreakBonus(streakDays: number) {
  return STREAK_BONUSES.get(streakDays) ?? 0;
}

export async function awardCompletionXp(userId: number, amount: number) {
  const [record] = await db
    .insert(userGamificationPoints)
    .values({
      userId,
      points: amount,
      level: computeLevelForPoints(amount),
      streakDays: 0,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userGamificationPoints.userId,
      set: {
        points: sql`${userGamificationPoints.points} + ${amount}`,
        updatedAt: new Date(),
      },
    })
    .returning({ points: userGamificationPoints.points });

  const totalPoints = record?.points ?? amount;
  const level = computeLevelForPoints(totalPoints);
  await db
    .update(userGamificationPoints)
    .set({ level })
    .where(and(eq(userGamificationPoints.userId, userId)));

  return totalPoints;
}

export const awardLessonCompletionXp = (userId: number) => awardCompletionXp(userId, LESSON_COMPLETION_XP);

/**
 * Recalcula a sequência atual de estudos do aluno e concede, de forma
 * idempotente, o bônus de qualquer marco (7/14/30/60/100 dias) que ele
 * tenha alcançado desde a última verificação. A coluna `streakDays` de
 * `user_gamification_points` guarda o maior marco já verificado/premiado
 * para este usuário, evitando conceder o mesmo bônus duas vezes.
 */
export async function checkAndAwardStreakBonus(userId: number): Promise<{ streakDays: number; bonusAwarded: number }> {
  const lookbackStart = new Date();
  lookbackStart.setUTCDate(lookbackStart.getUTCDate() - LOOKBACK_DAYS);

  const [lessonDates, activityDates, pointsRecord] = await Promise.all([
    db.select({ completedAt: lessonProgress.completedAt })
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.completed, 1), isNotNull(lessonProgress.completedAt), gte(lessonProgress.completedAt, lookbackStart))),
    db.select({ completedAt: userActivityProgress.completedAt })
      .from(userActivityProgress)
      .where(and(eq(userActivityProgress.userId, userId), eq(userActivityProgress.status, "completed"), isNotNull(userActivityProgress.completedAt), gte(userActivityProgress.completedAt, lookbackStart))),
    db.query.userGamificationPoints.findFirst({ where: eq(userGamificationPoints.userId, userId) }),
  ]);

  const currentStreak = calculateStreakDays([
    ...lessonDates.map((row) => row.completedAt).filter((d): d is Date => d instanceof Date),
    ...activityDates.map((row) => row.completedAt).filter((d): d is Date => d instanceof Date),
  ]);

  const previouslyCheckedStreak = pointsRecord?.streakDays ?? 0;
  const newlyReachedMilestones = STREAK_MILESTONES.filter((m) => m > previouslyCheckedStreak && m <= currentStreak);
  const bonusAwarded = newlyReachedMilestones.reduce((sum, m) => sum + getStreakBonus(m), 0);

  if (bonusAwarded > 0) {
    await awardCompletionXp(userId, bonusAwarded);
  }
  if (currentStreak >= 7 && previouslyCheckedStreak < 7) {
    await awardMedalIfEligible({ userId, medalCode: "constancia-na-trilha" });
  }
  if (currentStreak !== previouslyCheckedStreak) {
    await db.update(userGamificationPoints).set({ streakDays: currentStreak }).where(eq(userGamificationPoints.userId, userId));
  }

  return { streakDays: currentStreak, bonusAwarded };
}

export function isApprovedStudentSession(session: { user?: { approvalStatus?: string | null; role?: string | null } } | null | undefined) {
  if (!session?.user) return false;
  if (session.user.role === "admin") return true;
  return session.user.approvalStatus === "approved";
}
