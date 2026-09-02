import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { googleClassroomConnections, googleClassroomCourses, googleClassroomCoursework, googleClassroomSubmissions } from "@/drizzle/schema";
import { GoogleClassroomApiError, listGoogleClassroomStudentSubmissions, markClassroomConnectionError } from "@/lib/google-classroom-api";
import { getClassroomRouteIdentity, canSyncClassroomRole, unauthorizedClassroomResponse, isStudentClassroomConnection } from "@/lib/classroom-route-auth";

export const dynamic = "force-dynamic";

function googleTimestamp(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function POST(request: Request) {
  const identity = await getClassroomRouteIdentity(request);
  if (!identity) return unauthorizedClassroomResponse();
  const userId = identity.userId;

  const connection = await db.query.googleClassroomConnections.findFirst({
    where: and(eq(googleClassroomConnections.userId, userId), eq(googleClassroomConnections.status, "active")),
  });
  if (!connection || !canSyncClassroomRole(identity.role, connection.authorizedRole, "read")) {
    return NextResponse.json({ success: false, code: "NOT_CONNECTED", error: "Conecte o Google Classroom antes de importar entregas." }, { status: 409 });
  }

  const courses = await db.query.googleClassroomCourses.findMany({
    where: and(eq(googleClassroomCourses.connectionId, connection.id), eq(googleClassroomCourses.state, "ACTIVE")),
  });
  if (!courses.length) {
    return NextResponse.json({ success: false, code: "NO_COURSES", error: "Nenhum curso Classroom sincronizado está disponível." }, { status: 409 });
  }

  try {
    const now = new Date();
    let fetchedSubmissions = 0;
    let createdSubmissions = 0;
    let updatedSubmissions = 0;
    let ignoredSubmissions = 0;

    for (const course of courses) {
      const coursework = await db.query.googleClassroomCoursework.findMany({
        where: eq(googleClassroomCoursework.classroomCourseId, course.id),
      });
      const courseworkByExternalId = new Map(coursework.map(item => [item.classroomCourseworkId, item]));
      if (!coursework.length) continue;

      const submissions = await listGoogleClassroomStudentSubmissions(connection, course.classroomCourseId, isStudentClassroomConnection(connection.authorizedRole));
      fetchedSubmissions += submissions.length;
      const localCourseworkIds = submissions
        .map(item => courseworkByExternalId.get(item.courseWorkId)?.id)
        .filter((id): id is number => Number.isInteger(id));
      const existing = localCourseworkIds.length
        ? await db.select({ classroomSubmissionId: googleClassroomSubmissions.classroomSubmissionId, courseworkId: googleClassroomSubmissions.courseworkId })
          .from(googleClassroomSubmissions)
          .where(and(inArray(googleClassroomSubmissions.courseworkId, localCourseworkIds), inArray(googleClassroomSubmissions.classroomSubmissionId, submissions.map(item => item.id))))
        : [];
      const existingKeys = new Set(existing.map(item => `${item.courseworkId}:${item.classroomSubmissionId}`));

      for (const submission of submissions) {
        const localCoursework = courseworkByExternalId.get(submission.courseWorkId);
        if (!localCoursework) {
          ignoredSubmissions += 1;
          continue;
        }
        const key = `${localCoursework.id}:${submission.id}`;
        await db.insert(googleClassroomSubmissions).values({
          courseworkId: localCoursework.id,
          classroomSubmissionId: submission.id,
          studentGoogleUserId: submission.userId,
          state: submission.state || "NEW",
          late: Boolean(submission.late),
          draftGrade: submission.draftGrade === undefined ? null : String(submission.draftGrade),
          assignedGrade: submission.assignedGrade === undefined ? null : String(submission.assignedGrade),
          alternateLink: submission.alternateLink || null,
          creationTime: googleTimestamp(submission.creationTime),
          updateTime: googleTimestamp(submission.updateTime),
          submissionHistory: submission.submissionHistory || null,
          lastSyncedAt: now,
          createdAt: now,
          updatedAt: now,
        }).onConflictDoUpdate({
          target: [googleClassroomSubmissions.courseworkId, googleClassroomSubmissions.classroomSubmissionId],
          set: {
            studentGoogleUserId: submission.userId,
            state: submission.state || "NEW",
            late: Boolean(submission.late),
            draftGrade: submission.draftGrade === undefined ? null : String(submission.draftGrade),
            assignedGrade: submission.assignedGrade === undefined ? null : String(submission.assignedGrade),
            alternateLink: submission.alternateLink || null,
            creationTime: googleTimestamp(submission.creationTime),
            updateTime: googleTimestamp(submission.updateTime),
            submissionHistory: submission.submissionHistory || null,
            lastSyncedAt: now,
            updatedAt: now,
          },
        });
        if (existingKeys.has(key)) updatedSubmissions += 1;
        else createdSubmissions += 1;
      }
    }

    await db.update(googleClassroomConnections)
      .set({ status: "active", lastError: null, updatedAt: now })
      .where(eq(googleClassroomConnections.id, connection.id));

    return NextResponse.json({
      success: true,
      message: "Entregas e notas do Google Classroom importadas com sucesso.",
      stats: { syncedCourses: courses.length, fetchedSubmissions, createdSubmissions, updatedSubmissions, ignoredSubmissions, timestamp: now.toISOString() },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    await markClassroomConnectionError(connection.id, error);
    if (error instanceof GoogleClassroomApiError) {
      return NextResponse.json({ success: false, code: error.code, error: error.message }, { status: error.status });
    }
    console.error("Erro ao importar submissions do Google Classroom:", error);
    return NextResponse.json({ success: false, code: "SUBMISSIONS_SYNC_ERROR", error: "Não foi possível importar as entregas do Classroom." }, { status: 502 });
  }
}
