import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { speakingAttempts, users, lessonProgress, userActivityProgress, courseOfferStudents } from "@/drizzle/schema";
import { uploadLearningAudio } from "@/lib/learning-storage";
import { buildPedagogicalInterventions } from "@/lib/pedagogical-interventions";
import { isTechnicalLearnerIdentity } from "@/lib/technical-identities";
import { and, eq, inArray } from "drizzle-orm";
import { resolveAcademicContext } from "@/lib/academic-context";
import { canAccessAcademicContext } from "@/lib/academic-context";
import type { AdminAuthSession } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "professor" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const contextInput = { offerId: searchParams.get("offerId"), classId: searchParams.get("classId") };
    const hasContext = Boolean(contextInput.offerId || contextInput.classId);
    const context = hasContext ? await resolveAcademicContext(contextInput) : null;
    if (hasContext && !context) return NextResponse.json({ error: "Oferta ou turma não encontrada." }, { status: 404 });
    if (context && !(await canAccessAcademicContext(session as AdminAuthSession, context, "read"))) {
      return NextResponse.json({ error: "Você não tem acesso a este contexto acadêmico." }, { status: 403 });
    }

    const teacherEmail = session.user.email;
    let assignedStudents: any[] = [];
    const contextualStudentIds = context?.offerId
      ? (await db.query.courseOfferStudents.findMany({ where: eq(courseOfferStudents.offerId, context.offerId) }))
        .map((student) => student.userId)
        .filter((id): id is number => Number.isInteger(id))
      : null;
    if (contextualStudentIds && contextualStudentIds.length === 0) {
      return NextResponse.json({ students: [], lessonProgress: [], activityProgress: [], speakingAttempts: [], interventions: [], context });
    }
    if (session.user.role === "admin") {
      assignedStudents = await db.query.users.findMany({
        where: contextualStudentIds ? inArray(users.id, contextualStudentIds) : eq(users.role, "user"),
      });
    } else if (teacherEmail) {
      const teacher = await db.query.users.findFirst({
        where: eq(users.email, teacherEmail),
      });
      if (teacher) {
        assignedStudents = await db.query.users.findMany({
          where: contextualStudentIds ? inArray(users.id, contextualStudentIds) : eq(users.teacherId, teacher.id),
        });
      }
    }

    assignedStudents = assignedStudents.filter(
      student => !isTechnicalLearnerIdentity(student)
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
      interventions: buildPedagogicalInterventions({
        students: assignedStudents,
        activityProgress: allActivityProgress,
        speakingAttempts: allSpeakingAttempts,
      }),
      context: context ? { kind: context.kind, offerId: context.offerId, classId: context.classId, courseId: context.courseId } : null,
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
    const contextInput = { offerId: getValue("offerId"), classId: getValue("classId") };
    const hasContext = Boolean(contextInput.offerId || contextInput.classId);
    const teacherFeedback = String(getValue("teacherFeedback") || "").trim();
    const scoreValue = getValue("score");
    const attemptIdValue = getValue("attemptId");
    const teacherAudio = getValue("teacherAudio");
    const requestRevision = ["true", "1", "on"].includes(String(getValue("requestRevision") || "").toLowerCase());

    if (!activityProgressId) {
      return NextResponse.json({ error: "activityProgressId é obrigatório" }, { status: 400 });
    }

    const existingProgress = await db.query.userActivityProgress.findFirst({
      where: eq(userActivityProgress.id, activityProgressId),
    });
    if (!existingProgress) return NextResponse.json({ error: "Submissão não encontrada." }, { status: 404 });

    const context = hasContext ? await resolveAcademicContext(contextInput) : null;
    if (hasContext && !context) return NextResponse.json({ error: "Oferta ou turma não encontrada." }, { status: 404 });
    if (context && !(await canAccessAcademicContext(session as AdminAuthSession, context, "manage"))) {
      return NextResponse.json({ error: "Você não tem permissão para avaliar neste contexto acadêmico." }, { status: 403 });
    }
    if (context?.offerId) {
      const enrollment = await db.query.courseOfferStudents.findFirst({
        where: and(eq(courseOfferStudents.offerId, context.offerId), eq(courseOfferStudents.userId, existingProgress.userId)),
      });
      if (!enrollment) return NextResponse.json({ error: "O aluno não está matriculado nesta oferta." }, { status: 403 });
    }

    const teacher = session.user.email ? await db.query.users.findFirst({ where: eq(users.email, session.user.email) }) : null;
    if (session.user.role === "professor") {
      if (!teacher) return NextResponse.json({ error: "Não foi possível confirmar sua identidade docente." }, { status: 403 });
      const assignedStudent = await db.query.users.findFirst({ where: and(eq(users.id, existingProgress.userId), eq(users.teacherId, teacher.id)) });
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
    if (requestRevision && teacherFeedback.length < 12) {
      return NextResponse.json({ error: "Explique em pelo menos 12 caracteres o que o estudante deve revisar antes de reenviar." }, { status: 400 });
    }
    const feedbackToSave = teacherFeedback;
    const progressUpdate = {
      teacherFeedback: feedbackToSave,
      score: finalScore,
      status: requestRevision ? "in_progress" as const : "completed" as const,
      completedAt: requestRevision ? null : new Date(),
      ...(teacherAudioFeedbackUrl ? { teacherAudioFeedbackUrl } : {}),
    };

    const updated = await db
      .update(userActivityProgress)
      .set(progressUpdate)
      .where(eq(userActivityProgress.id, activityProgressId))
      .returning();

    if (targetAttempt) {
      await db.update(speakingAttempts).set({
        teacherFeedback: feedbackToSave,
        ...(teacherAudioFeedbackUrl ? { teacherAudioFeedbackUrl } : {}),
      }).where(eq(speakingAttempts.id, targetAttempt.id));
    }

    return NextResponse.json({ success: true, progress: updated[0], teacherAudioFeedbackUrl, revisionRequested: requestRevision, context: context ? { kind: context.kind, offerId: context.offerId, classId: context.classId, courseId: context.courseId } : null });
  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 });
  }
}
