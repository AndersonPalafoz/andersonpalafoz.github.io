import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { userGamificationPoints } from "@/drizzle/schema";

export const LESSON_COMPLETION_XP = 10;
export const ACTIVITY_COMPLETION_XP = 10;

const STREAK_BONUSES = new Map<number, number>([
  [7, 50],
  [14, 100],
  [30, 250],
  [60, 500],
  [100, 1000],
]);

function utcDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function shiftUtcDate(date: Date, days: number) {
  const shifted = new Date(date);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted;
}

export function calculateStreakDays(activityDates: readonly Date[], today = new Date()) {
  const dateKeys = new Set(activityDates.map(utcDateKey));
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
      level: "Não iniciado",
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

  return record?.points ?? amount;
}

export const awardLessonCompletionXp = (userId: number) => awardCompletionXp(userId, LESSON_COMPLETION_XP);

export function isApprovedStudentSession(session: { user?: { approvalStatus?: string | null; role?: string | null } } | null | undefined) {
  if (!session?.user) return false;
  if (session.user.role === "admin") return true;
  return session.user.approvalStatus === "approved";
}
