import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { desc, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db, getUserByEmail } from "@/lib/db";
import { activities, courses, userActivityProgress } from "@/drizzle/schema";
import { getAdaptiveRecommendations } from "@/lib/adaptive-learning";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404, headers: { "Cache-Control": "no-store" } });

  const rows = await db.select({
    activityId: userActivityProgress.activityId,
    courseId: activities.courseId,
    activityTitle: activities.title,
    activityDescription: activities.description,
    courseTitle: courses.title,
    courseLevel: courses.level,
    score: userActivityProgress.score,
    status: userActivityProgress.status,
  })
    .from(userActivityProgress)
    .innerJoin(activities, eq(userActivityProgress.activityId, activities.id))
    .innerJoin(courses, eq(activities.courseId, courses.id))
    .where(eq(userActivityProgress.userId, user.id))
    .orderBy(desc(userActivityProgress.submittedAt));

  const recommendations = getAdaptiveRecommendations(rows);
  return NextResponse.json({ recommendations, sourceCount: rows.length }, { headers: { "Cache-Control": "no-store" } });
}
