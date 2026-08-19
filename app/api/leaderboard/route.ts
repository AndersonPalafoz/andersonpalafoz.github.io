import { NextResponse } from "next/server";
import { and, eq, gte, inArray, isNotNull, isNull, ne } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { enrollments, lessonProgress, medalsCatalog, userActivityProgress, userGamificationPoints, userMedals, users } from "@/drizzle/schema";
import { calculateStreakDays, isApprovedStudentSession } from "@/lib/gamification";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!isApprovedStudentSession(session) || !session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
    }

    const currentUser = await db.query.users.findFirst({
      where: and(eq(users.email, session.user.email), isNull(users.deletedAt)),
    });
    if (!currentUser) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const currentEnrollments = await db.select({ courseId: enrollments.courseId })
      .from(enrollments)
      .where(and(
        eq(enrollments.userId, currentUser.id),
        inArray(enrollments.status, ["active", "completed"]),
      ));
    const courseIds = Array.from(new Set(currentEnrollments.map((row) => row.courseId).filter((id): id is number => Number.isInteger(id))));
    if (courseIds.length === 0) return NextResponse.json([], { headers: { "Cache-Control": "private, no-store" } });

    const peerRows = await db.selectDistinct({ id: users.id, name: users.name })
      .from(users)
      .innerJoin(enrollments, eq(enrollments.userId, users.id))
      .where(and(
        inArray(enrollments.courseId, courseIds),
        inArray(enrollments.status, ["active", "completed"]),
        eq(users.approvalStatus, "approved"),
        isNull(users.deletedAt),
        ne(users.role, "admin"),
      ))
      .limit(100);
    const peerIds = peerRows.map((row) => row.id);

    const lookbackStart = new Date();
    lookbackStart.setUTCDate(lookbackStart.getUTCDate() - 365);
    const [pointRows, medalRows, lessonDates, activityDates] = await Promise.all([
      peerIds.length ? db.select({ userId: userGamificationPoints.userId, points: userGamificationPoints.points })
        .from(userGamificationPoints)
        .where(inArray(userGamificationPoints.userId, peerIds)) : Promise.resolve([]),
      peerIds.length ? db.select({ userId: userMedals.userId, medalCode: userMedals.medalCode })
        .from(userMedals)
        .innerJoin(medalsCatalog, eq(userMedals.medalCode, medalsCatalog.code))
        .where(inArray(userMedals.userId, peerIds)) : Promise.resolve([]),
      peerIds.length ? db.select({ userId: lessonProgress.userId, completedAt: lessonProgress.completedAt })
        .from(lessonProgress)
        .where(and(inArray(lessonProgress.userId, peerIds), eq(lessonProgress.completed, 1), isNotNull(lessonProgress.completedAt), gte(lessonProgress.completedAt, lookbackStart))) : Promise.resolve([]),
      peerIds.length ? db.select({ userId: userActivityProgress.userId, completedAt: userActivityProgress.completedAt })
        .from(userActivityProgress)
        .where(and(inArray(userActivityProgress.userId, peerIds), eq(userActivityProgress.status, "completed"), isNotNull(userActivityProgress.completedAt), gte(userActivityProgress.completedAt, lookbackStart))) : Promise.resolve([]),
    ]);

    const pointsByUser = new Map(pointRows.map((row) => [row.userId, row]));
    const activityDatesByUser = new Map<number, Date[]>();
    for (const row of [...lessonDates, ...activityDates]) {
      if (!(row.completedAt instanceof Date)) continue;
      const dates = activityDatesByUser.get(row.userId) ?? [];
      dates.push(row.completedAt);
      activityDatesByUser.set(row.userId, dates);
    }
    const medalsByUser = new Map<number, Set<string>>();
    for (const medal of medalRows) {
      const set = medalsByUser.get(medal.userId) ?? new Set<string>();
      set.add(medal.medalCode);
      medalsByUser.set(medal.userId, set);
    }

    const leaderboard = peerRows.map((peer) => {
      const points = pointsByUser.get(peer.id);
      return {
        userId: peer.id,
        name: peer.name || "Estudante",
        totalXp: Number(points?.points ?? 0),
        streakDays: calculateStreakDays(activityDatesByUser.get(peer.id) ?? []),
        medalsCount: medalsByUser.get(peer.id)?.size ?? 0,
      };
    }).sort((a, b) => b.totalXp - a.totalXp || b.streakDays - a.streakDays || a.name.localeCompare(b.name, "pt-BR"))
      .slice(0, 20)
      .map((item, index) => ({ rank: index + 1, ...item }));

    return NextResponse.json(leaderboard, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Falha ao carregar ranking" }, { status: 500, headers: { "Cache-Control": "private, no-store" } });
  }
}
