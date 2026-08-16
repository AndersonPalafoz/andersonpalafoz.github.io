import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { asc, and, eq, inArray } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { activities, attendances, classSessions, courses, enrollments, userActivityProgress, users } from "@/drizzle/schema";
import { buildAcademicTimeline } from "@/lib/academic-analytics";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

    const student = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
    if (!student) return NextResponse.json({ error: "Aluno não encontrado." }, { status: 404 });

    const grades = await db.select({
      score: userActivityProgress.score,
      submittedAt: userActivityProgress.submittedAt,
      activityTitle: activities.title,
      courseTitle: courses.title,
    }).from(userActivityProgress)
      .innerJoin(activities, eq(userActivityProgress.activityId, activities.id))
      .innerJoin(courses, eq(activities.courseId, courses.id))
      .where(and(eq(userActivityProgress.userId, student.id)))
      .orderBy(asc(userActivityProgress.submittedAt));

    const attendanceRows = await db.select({
      status: attendances.status,
      recordedAt: attendances.recordedAt,
      sessionTitle: classSessions.title,
    }).from(attendances)
      .innerJoin(classSessions, eq(attendances.sessionId, classSessions.id))
      .where(eq(attendances.studentId, student.id))
      .orderBy(asc(attendances.recordedAt));

    const enrolledRows = await db.select({ courseId: enrollments.courseId }).from(enrollments).where(and(eq(enrollments.userId, student.id), inArray(enrollments.status, ["active", "completed", "paused"])));
    const enrolledCourseIds = Array.from(new Set(enrolledRows.map((row) => row.courseId)));

    const classGradeRows = enrolledCourseIds.length ? await db.select({ score: userActivityProgress.score, submittedAt: userActivityProgress.submittedAt }).from(userActivityProgress)
      .innerJoin(activities, eq(userActivityProgress.activityId, activities.id))
      .where(and(inArray(activities.courseId, enrolledCourseIds)))
      .orderBy(asc(userActivityProgress.submittedAt)) : [];
    const classAttendanceRows = enrolledCourseIds.length ? await db.select({ status: attendances.status, recordedAt: attendances.recordedAt }).from(attendances)
      .innerJoin(classSessions, eq(attendances.sessionId, classSessions.id))
      .where(inArray(classSessions.courseId, enrolledCourseIds))
      .orderBy(asc(attendances.recordedAt)) : [];

    const timeline = buildAcademicTimeline(
      grades.map((grade) => ({ score: grade.score === null ? null : Number(grade.score), occurredAt: grade.submittedAt })),
      attendanceRows.map((row) => ({ status: row.status, occurredAt: row.recordedAt })),
    );
    const classTimeline = buildAcademicTimeline(
      classGradeRows.map((grade) => ({ score: grade.score === null ? null : Number(grade.score), occurredAt: grade.submittedAt })),
      classAttendanceRows.map((row) => ({ status: row.status, occurredAt: row.recordedAt })),
    );

    return NextResponse.json({
      timeline,
      classTimeline,
      grades: grades.map((grade) => ({ ...grade, score: grade.score === null ? null : Number(grade.score) })),
      attendance: attendanceRows,
    });
  } catch (error) {
    console.error("Erro ao carregar histórico acadêmico:", error);
    return NextResponse.json({ error: "Não foi possível carregar o histórico acadêmico." }, { status: 500 });
  }
}
