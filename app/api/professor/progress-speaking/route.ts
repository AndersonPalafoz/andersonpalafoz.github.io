import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { speakingAttempts, users, lessonProgress, userActivityProgress } from "@/drizzle/schema";
import { uploadLearningAudio } from "@/lib/learning-storage";
import { and, eq, inArray } from "drizzle-orm";

function isTechnicalCertificateAccount(student: {
  email?: string | null;
  loginMethod?: string | null;
  name?: string | null;
}) {
  const email = student.email?.trim().toLowerCase() || "";
  const name = student.name?.trim().toLowerCase() || "";
  return (
    student.loginMethod === "manual_external" ||
    email.endsWith("@external.placeholder") ||
    email.startsWith("nao-cadastrado-") ||
    name.includes("teste docx")
  );
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "professor" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    assignedStudents = assignedStudents.filter(
      student => !isTechnicalCertificateAccount(student)
    );
    const studentIds = assignedStudents.map(s => s.id);

    const allLessonProgress = studentIds.length > 0 ? await db.query.lessonProgress.findMany({
      where: inArray(lessonProgress.userId, studentIds),
    }) : [];

    const allActivityProgress = studentIds.length > 0 ? await db.query.userActivityProgress.findMany({
      where: inArray(userActivityProgress.userId, studentIds),
      with: {
        activity: true,
      },
    }) : [];
    const allSpeakingAttempts = studentIds.length > 0 ? await db.query.speakingAttempts.findMany({
      where: inArray(speakingAttempts.userId, studentIds),
      orderBy: (table, { desc }) => desc(table.attemptNumber),
    }) : [];

    return NextResponse.json({
      students: assignedStudents,
      lessonProgress: allLessonProgress,
      activityProgress: allActivityProgress,
      speakingAttempts: allSpeakingAttempts,
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

    const isMultipart = request.headers.get("content-type")?.includes("multipart/form-data");
    const body = isMultipart ? await request.formData() : await request.json();
    const getValue = (key: string) => body instanceof FormData ? body.get(key) : body[key];
    const activityProgressId = Number(getValue("activityProgressId"));
    const teacherFeedback = String(getValue("teacherFeedback") || "").trim();
    const scoreValue = getValue("score");
    const attemptIdValue = getValue("attemptId");
    const teacherAudio = getValue("teacherAudio");

    if (!activityProgressId) {
      return NextResponse.json({ error: "activityProgressId é obrigatório" }, { status: 400 });
    }

    const existingProgress = await db.query.userActivityProgress.findFirst({
      where: eq(userActivityProgress.id, activityProgressId),
    });
    if (!existingProgress) return NextResponse.json({ error: "Submissão não encontrada." }, { status: 404 });

    const teacher = session.user.email ? await db.query.users.findFirst({ where: eq(users.email, session.user.email) }) : null;
    if (session.user.role === "professor" && (!teacher || existingProgress.userId !== teacher.id)) {
      const assignedStudent = await db.query.users.findFirst({ where: and(eq(users.id, existingProgress.userId), eq(users.teacherId, teacher?.id ?? -1)) });
      if (!assignedStudent) return NextResponse.json({ error: "Você não tem acesso a esta submissão." }, { status: 403 });
    }
    let teacherAudioFeedbackUrl: string | undefined;
    if (teacherAudio instanceof File) {
      teacherAudioFeedbackUrl = (await uploadLearningAudio(teacher?.id || 0, teacherAudio, "teacher-feedback")).url;
    }

    const targetAttempt = attemptIdValue ? await db.query.speakingAttempts.findFirst({
      where: and(eq(speakingAttempts.id, Number(attemptIdValue)), eq(speakingAttempts.userId, existingProgress.userId), eq(speakingAttempts.activityId, existingProgress.activityId)),
    }) : null;
    const parsedScore = scoreValue !== undefined && scoreValue !== null && String(scoreValue) !== "" ? Number(scoreValue) : null;
    const finalScore = parsedScore !== null && Number.isFinite(parsedScore) ? parsedScore : existingProgress.score;
    if (finalScore === null || finalScore === undefined) return NextResponse.json({ error: "Informe uma nota do professor antes de concluir a avaliação." }, { status: 400 });
    const feedbackToSave = teacherFeedback;

    const updated = await db
      .update(userActivityProgress)
      .set({
        teacherFeedback: feedbackToSave,
        teacherAudioFeedbackUrl,
        score: finalScore,
        status: "completed",
        completedAt: new Date(),
      })
      .where(eq(userActivityProgress.id, activityProgressId))
      .returning();

    if (targetAttempt) {
      await db.update(speakingAttempts).set({
        teacherFeedback: feedbackToSave,
        teacherAudioFeedbackUrl,
      }).where(eq(speakingAttempts.id, targetAttempt.id));
    }

    return NextResponse.json({ success: true, progress: updated[0], teacherAudioFeedbackUrl });
  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 });
  }
}
