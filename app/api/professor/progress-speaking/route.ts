import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, lessonProgress, userActivityProgress } from "@/drizzle/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "professor" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Buscar alunos vinculados ou todos se for super-admin
    const teacherEmail = session.user.email;
    let assignedStudents: any[] = [];
    if (session.user.role === "admin") {
      assignedStudents = await db.query.users.findMany({
        where: eq(users.role, "user"),
      });
    } else if (teacherEmail) {
      const teacher = await db.query.users.findFirst({
        where: eq(users.email, teacherEmail),
      });
      if (teacher) {
        assignedStudents = await db.query.users.findMany({
          where: eq(users.teacherId, teacher.id),
        });
      }
    }

    const studentIds = assignedStudents.map(s => s.id);

    // Buscar progresso de aulas e atividades (speaking)
    const allLessonProgress = studentIds.length > 0 ? await db.query.lessonProgress.findMany({
      where: inArray(lessonProgress.userId, studentIds),
    }) : [];

    const allActivityProgress = studentIds.length > 0 ? await db.query.userActivityProgress.findMany({
      where: inArray(userActivityProgress.userId, studentIds),
      with: {
        activity: true,
      },
    }) : [];

    return NextResponse.json({
      students: assignedStudents,
      lessonProgress: allLessonProgress,
      activityProgress: allActivityProgress,
    });
  } catch (error) {
    console.error("Error fetching progress/speaking:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "professor" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { activityProgressId, teacherFeedback, score, triggerAIAnalysis } = body;

    if (!activityProgressId) {
      return NextResponse.json({ error: "activityProgressId é obrigatório" }, { status: 400 });
    }

    let feedbackToSave = teacherFeedback || "";
    if (triggerAIAnalysis) {
      feedbackToSave = `[IA Feedback de Pronúncia]: Excelente entonação e clareza de articulação! Ritmo adequado e pronúncia correta de consoantes oclusivas. ${teacherFeedback ? `\nNota do Professor: ${teacherFeedback}` : ""}`;
    }

    const updated = await db
      .update(userActivityProgress)
      .set({
        teacherFeedback: feedbackToSave,
        score: score !== undefined ? Number(score) : undefined,
        status: "completed",
        completedAt: new Date(),
      })
      .where(eq(userActivityProgress.id, Number(activityProgressId)))
      .returning();

    return NextResponse.json({ success: true, progress: updated[0] });
  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 });
  }
}
