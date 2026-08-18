import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { and, eq, gte, isNotNull } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db, getUserByEmail } from "@/lib/db";
import { lessonProgress, userActivityProgress } from "@/drizzle/schema";

export const dynamic = "force-dynamic";

function getMondayUtc(date = new Date()) {
  const day = date.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + mondayOffset));
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const user = await getUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const weekStart = getMondayUtc();
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

  const [lessonRows, activityRows] = await Promise.all([
    db.select({ completedAt: lessonProgress.completedAt })
      .from(lessonProgress)
      .where(and(
        eq(lessonProgress.userId, user.id),
        eq(lessonProgress.completed, 1),
        isNotNull(lessonProgress.completedAt),
        gte(lessonProgress.completedAt, weekStart),
      )),
    db.select({ completedAt: userActivityProgress.completedAt })
      .from(userActivityProgress)
      .where(and(
        eq(userActivityProgress.userId, user.id),
        eq(userActivityProgress.status, "completed"),
        isNotNull(userActivityProgress.completedAt),
        gte(userActivityProgress.completedAt, weekStart),
      )),
  ]);

  const lessonCounts = new Map<string, number>();
  const activityCounts = new Map<string, number>();
  for (const row of lessonRows) {
    if (row.completedAt && row.completedAt < weekEnd) {
      const key = dateKey(row.completedAt);
      lessonCounts.set(key, (lessonCounts.get(key) ?? 0) + 1);
    }
  }
  for (const row of activityRows) {
    if (row.completedAt && row.completedAt < weekEnd) {
      const key = dateKey(row.completedAt);
      activityCounts.set(key, (activityCounts.get(key) ?? 0) + 1);
    }
  }

  const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const days = dayLabels.map((label, index) => {
    const date = new Date(weekStart);
    date.setUTCDate(date.getUTCDate() + index);
    const key = dateKey(date);
    return {
      key,
      label,
      date: key,
      lessons: lessonCounts.get(key) ?? 0,
      activities: activityCounts.get(key) ?? 0,
    };
  });

  return NextResponse.json({
    weekStart: dateKey(weekStart),
    weekEnd: dateKey(weekEnd),
    days,
    totals: {
      lessons: days.reduce((sum, day) => sum + day.lessons, 0),
      activities: days.reduce((sum, day) => sum + day.activities, 0),
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
