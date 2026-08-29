import { NextResponse } from "next/server";
import { and, eq, inArray, like } from "drizzle-orm";
import { getLessonById, getModuleById, getUserLessonProgress, updateLessonProgress, db } from "@/lib/db";
import { issueCertificateIfEligible } from "@/lib/certificate-service";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { awardLessonCompletionXp, checkAndAwardStreakBonus, LESSON_COMPLETION_XP } from "@/lib/gamification";
import { eventLogs, lessonProgress, lessons, modules } from "@/drizzle/schema";
import { awardMedalIfEligible } from "@/lib/medal-awards";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const lessonId = Number.parseInt(id, 10);
    const body = await request.json();
    const completed = Boolean(body.completed);
    const userId = Number.parseInt(session.user.id ?? "", 10);
    if (!Number.isInteger(lessonId) || lessonId <= 0 || !Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Identificador inválido." }, { status: 400 });
    }

    const previousProgress = await getUserLessonProgress(userId, lessonId);
    const existingCompletionEvent = completed
      ? await db.query.eventLogs.findFirst({
        where: and(
          eq(eventLogs.userId, userId),
          eq(eventLogs.eventType, "activity_complete"),
          like(eventLogs.details, `%\"lessonId\":${lessonId}%`),
        ),
      })
      : null;

    await updateLessonProgress(userId, lessonId, completed ? 1 : 0);

    let pointsAwarded = 0;
    if (completed && previousProgress?.completed !== 1 && !existingCompletionEvent) {
      await awardLessonCompletionXp(userId);
      pointsAwarded = LESSON_COMPLETION_XP;
      await checkAndAwardStreakBonus(userId);
      await db.insert(eventLogs).values({
        userId,
        userEmail: session.user.email ?? null,
        eventType: "activity_complete",
        details: JSON.stringify({ source: "lesson", lessonId }),
      });
    }

    let awardedMedals: string[] = [];
    if (completed) {
      const module = await getModuleById((await getLessonById(lessonId))?.moduleId ?? 0);
      if (module) {
        const courseModules = await db.select({ id: modules.id }).from(modules).where(eq(modules.courseId, module.courseId));
        const courseModuleIds = courseModules.map((row) => row.id);
        const courseLessons = courseModuleIds.length
          ? await db.select({ id: lessons.id }).from(lessons).where(inArray(lessons.moduleId, courseModuleIds))
          : [];
        const completedLessons = await db.select({ id: lessonProgress.id })
          .from(lessonProgress)
          .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.completed, 1), inArray(lessonProgress.lessonId, courseLessons.map((row) => row.id))));
        if (completedLessons.length >= 1) {
          const firstStep = await awardMedalIfEligible({ userId, medalCode: "primeiro-passo" });
          if (firstStep.awarded) awardedMedals.push(firstStep.medal.medalCode);
        }
        if (courseLessons.length > 0 && completedLessons.length / courseLessons.length >= 0.25) {
          const started = await awardMedalIfEligible({ userId, medalCode: "trilha-iniciada" });
          if (started.awarded) awardedMedals.push(started.medal.medalCode);
        }
      }
    }

    let certificate = null;
    if (completed) {
      const lesson = await getLessonById(lessonId);
      const module = lesson ? await getModuleById(lesson.moduleId) : null;
      if (module) {
        const result = await issueCertificateIfEligible(userId, module.courseId);
        certificate = result.certificate;
      }
    }
    return NextResponse.json({ success: true, certificate, pointsAwarded, awardedMedals });
  } catch (error) {
    console.error("Error updating lesson progress:", error);
    return NextResponse.json({ error: "Não foi possível atualizar o progresso da aula." }, { status: 500 });
  }
}
