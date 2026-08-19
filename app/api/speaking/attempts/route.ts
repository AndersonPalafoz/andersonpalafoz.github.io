import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { analyzeSpeakingAudio } from "@/lib/ai-pronunciation";
import { createSpeakingAttempt, db, getSpeakingAttempts } from "@/lib/db";
import { activities, eventLogs, userActivityProgress, users } from "@/drizzle/schema";
import { uploadLearningAudio } from "@/lib/learning-storage";
import { ACTIVITY_COMPLETION_XP, awardCompletionXp } from "@/lib/gamification";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    const activityId = Number(request.nextUrl.searchParams.get("activityId"));
    if (!Number.isInteger(activityId) || activityId <= 0) return NextResponse.json({ error: "activityId inválido." }, { status: 400 });

    const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    const attempts = await getSpeakingAttempts(user.id, activityId);
    return NextResponse.json({ attempts });
  } catch (error) {
    console.error("Error listing speaking attempts:", error);
    return NextResponse.json({ error: "Não foi possível carregar o histórico de Speaking." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    const formData = await request.formData();
    const activityId = Number(formData.get("activityId"));
    const audio = formData.get("audio");
    const transcript = String(formData.get("transcript") || "").trim() || null;
    if (!Number.isInteger(activityId) || activityId <= 0 || !(audio instanceof File)) {
      return NextResponse.json({ error: "Envie activityId e um arquivo de áudio válido." }, { status: 400 });
    }

    const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
    const activity = await db.query.activities.findFirst({ where: eq(activities.id, activityId) });
    if (!user || !activity) return NextResponse.json({ error: "Atividade ou usuário não encontrado." }, { status: 404 });
    if (activity.type !== "speaking") return NextResponse.json({ error: "A atividade informada não é de Speaking." }, { status: 400 });

    const uploaded = await uploadLearningAudio(user.id, audio, "student-attempt");
    const analysis = await analyzeSpeakingAudio(uploaded.url);
    const previousAttempts = await getSpeakingAttempts(user.id, activityId);
    const previous = previousAttempts[0];
    const attempt = await createSpeakingAttempt({
      userId: user.id,
      activityId,
      audioResponseUrl: uploaded.url,
      transcript,
      aiScore: analysis.score,
      aiFeedback: analysis.feedback,
      aiSuggestions: JSON.stringify(analysis.suggestions),
    });

    const currentProgress = await db.query.userActivityProgress.findFirst({
      where: (table) => and(eq(table.userId, user.id), eq(table.activityId, activityId)),
    });
    const existingCompletionEvent = await db.query.eventLogs.findFirst({
      where: (table) => and(
        eq(table.userId, user.id),
        eq(table.eventType, "activity_complete"),
        eq(table.details, JSON.stringify({ source: "activity", activityId })),
      ),
    });
    const shouldAwardCompletionXp = currentProgress?.status !== "completed" && !existingCompletionEvent;
    if (currentProgress) {
      await db.update(userActivityProgress).set({
        audioResponseUrl: uploaded.url,
        score: analysis.score,
        submittedAt: new Date(),
        status: "completed",
        completedAt: new Date(),
      }).where(eq(userActivityProgress.id, currentProgress.id));
    } else {
      await db.insert(userActivityProgress).values({
        userId: user.id,
        activityId,
        audioResponseUrl: uploaded.url,
        score: analysis.score,
        submittedAt: new Date(),
        status: "completed",
        completedAt: new Date(),
      });
    }

    let pointsAwarded = 0;
    if (shouldAwardCompletionXp) {
      await awardCompletionXp(user.id, ACTIVITY_COMPLETION_XP);
      pointsAwarded = ACTIVITY_COMPLETION_XP;
      await db.insert(eventLogs).values({
        userId: user.id,
        userEmail: user.email,
        eventType: "activity_complete",
        details: JSON.stringify({ source: "activity", activityId }),
      });
    }

    return NextResponse.json({
      success: true,
      pointsAwarded,
      attempt,
      comparison: previous ? { previousScore: previous.aiScore, improvement: analysis.score - (previous.aiScore || 0) } : null,
    });
  } catch (error) {
    console.error("Error creating speaking attempt:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível salvar a gravação." }, { status: 500 });
  }
}
