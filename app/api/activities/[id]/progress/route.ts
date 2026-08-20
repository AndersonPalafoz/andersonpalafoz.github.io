import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { ACTIVITY_COMPLETION_XP, awardCompletionXp } from "@/lib/gamification";
import { db } from "@/lib/db";
import { activities, eventLogs, userActivityProgress, users } from "@/drizzle/schema";

function activityIdFrom(params: { id: string }) {
  const value = Number(params.id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user?.email ? db.query.users.findFirst({ where: eq(users.email, session.user.email) }) : null;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const activityId = activityIdFrom(await context.params);
  if (!activityId) return NextResponse.json({ error: "Atividade inválida." }, { status: 400 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ completed: false, authenticated: false });

  const activity = await db.query.activities.findFirst({ where: eq(activities.id, activityId) });
  if (!activity || !["listening", "speaking"].includes(activity.type)) return NextResponse.json({ error: "Atividade de Listening ou Speaking não encontrada." }, { status: 404 });
  const progress = await db.query.userActivityProgress.findFirst({
    where: and(eq(userActivityProgress.userId, user.id), eq(userActivityProgress.activityId, activityId)),
  });
  return NextResponse.json({ completed: progress?.status === "completed", authenticated: true, progress: progress || null });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const activityId = activityIdFrom(await context.params);
  if (!activityId) return NextResponse.json({ error: "Atividade inválida." }, { status: 400 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });

  const activity = await db.query.activities.findFirst({ where: eq(activities.id, activityId) });
  if (!activity || !["listening", "speaking"].includes(activity.type)) return NextResponse.json({ error: "Atividade de Listening ou Speaking não encontrada." }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const completed = body.completed !== false;
  const currentProgress = await db.query.userActivityProgress.findFirst({
    where: and(eq(userActivityProgress.userId, user.id), eq(userActivityProgress.activityId, activityId)),
  });
  const wasCompleted = currentProgress?.status === "completed";

  let progress;
  if (currentProgress) {
    progress = (await db.update(userActivityProgress).set({
      status: completed ? "completed" : "pending",
      submittedAt: completed ? new Date() : null,
      completedAt: completed ? new Date() : null,
    }).where(eq(userActivityProgress.id, currentProgress.id)).returning())[0];
  } else {
    progress = (await db.insert(userActivityProgress).values({
      userId: user.id,
      activityId,
      status: completed ? "completed" : "pending",
      submittedAt: completed ? new Date() : null,
      completedAt: completed ? new Date() : null,
    }).returning())[0];
  }

  let pointsAwarded = 0;
  if (completed && !wasCompleted) {
    const existingCompletionEvent = await db.query.eventLogs.findFirst({
      where: and(
        eq(eventLogs.userId, user.id),
        eq(eventLogs.eventType, "activity_complete"),
        eq(eventLogs.details, JSON.stringify({ source: "activity", activityId })),
      ),
    });
    if (!existingCompletionEvent) {
      await awardCompletionXp(user.id, ACTIVITY_COMPLETION_XP);
      pointsAwarded = ACTIVITY_COMPLETION_XP;
      await db.insert(eventLogs).values({
        userId: user.id,
        userEmail: user.email,
        eventType: "activity_complete",
        details: JSON.stringify({ source: "activity", activityId }),
      });
    }
  }

  return NextResponse.json({ success: true, completed, pointsAwarded, progress });
}
