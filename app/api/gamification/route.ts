import { NextResponse } from "next/server";
import { and, eq, gte, isNotNull } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { lessonProgress, userActivityProgress, userGamificationPoints, users } from "@/drizzle/schema";
import { calculateStreakDays } from "@/lib/gamification";

export const dynamic = "force-dynamic";

const LOOKBACK_DAYS = 365;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }

    const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
    if (!user || user.deletedAt) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }
    if (user.role !== "admin" && user.approvalStatus !== "approved") {
      return NextResponse.json({ error: "Conta ainda não aprovada" }, { status: 403, headers: { "Cache-Control": "no-store" } });
    }

    const lookbackStart = new Date();
    lookbackStart.setUTCDate(lookbackStart.getUTCDate() - LOOKBACK_DAYS);

    const [lessonDates, activityDates, pointsRecord] = await Promise.all([
      db.select({ completedAt: lessonProgress.completedAt })
        .from(lessonProgress)
        .where(and(
          eq(lessonProgress.userId, user.id),
          eq(lessonProgress.completed, 1),
          isNotNull(lessonProgress.completedAt),
          gte(lessonProgress.completedAt, lookbackStart),
        )),
      db.select({ completedAt: userActivityProgress.completedAt })
        .from(userActivityProgress)
        .where(and(
          eq(userActivityProgress.userId, user.id),
          eq(userActivityProgress.status, "completed"),
          isNotNull(userActivityProgress.completedAt),
          gte(userActivityProgress.completedAt, lookbackStart),
        )),
      db.query.userGamificationPoints.findFirst({ where: eq(userGamificationPoints.userId, user.id) }),
    ]);

    const activityDatesForStreak = [
      ...lessonDates.map((row) => row.completedAt).filter((date): date is Date => date instanceof Date),
      ...activityDates.map((row) => row.completedAt).filter((date): date is Date => date instanceof Date),
    ];
    const streakDays = calculateStreakDays(activityDatesForStreak);

    return NextResponse.json({
      success: true,
      points: pointsRecord?.points ?? 0,
      level: pointsRecord?.level ?? null,
      streakDays,
      hasPersistedGamificationRecord: Boolean(pointsRecord),
      isNewRecord: Boolean(pointsRecord && streakDays > pointsRecord.streakDays),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error fetching gamification points:", error);
    return NextResponse.json({ error: "Falha ao carregar dados de gamificação" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
