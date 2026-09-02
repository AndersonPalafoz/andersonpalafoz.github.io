import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { googleClassroomConnections, googleClassroomCourses, googleClassroomRosters, googleClassroomCoursework, googleClassroomSubmissions, users } from "@/drizzle/schema";
import { GoogleClassroomApiError, listGoogleClassroomStudents, markClassroomConnectionError } from "@/lib/google-classroom-api";
import { getClassroomRouteIdentity, canSyncClassroomRole, unauthorizedClassroomResponse } from "@/lib/classroom-route-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const identity = await getClassroomRouteIdentity(request);
  if (!identity) return unauthorizedClassroomResponse();
  const userId = identity.userId;

  const connection = await db.query.googleClassroomConnections.findFirst({
    where: and(eq(googleClassroomConnections.userId, userId), eq(googleClassroomConnections.status, "active")),
  });
  if (!connection || !canSyncClassroomRole(identity.role, connection.authorizedRole, "roster")) return NextResponse.json({ success: false, code: "ROSTER_FORBIDDEN", error: "A sincronização de participantes está disponível somente para conexões de professor." }, { status: 403 });

  const courses = await db.query.googleClassroomCourses.findMany({
    where: and(eq(googleClassroomCourses.connectionId, connection.id), eq(googleClassroomCourses.state, "ACTIVE")),
  });
  if (!courses.length) return NextResponse.json({ success: false, code: "NO_COURSES", error: "Nenhum curso Classroom sincronizado está disponível." }, { status: 409 });

  try {
    const localUsers = await db.select({ id: users.id, email: users.email }).from(users);
    const usersByEmail = new Map<string, number[]>();
    for (const localUser of localUsers) {
      const email = localUser.email?.trim().toLowerCase();
      if (!email) continue;
      usersByEmail.set(email, [...(usersByEmail.get(email) || []), localUser.id]);
    }

    const now = new Date();
    let fetchedStudents = 0;
    let createdRoster = 0;
    let updatedRoster = 0;
    let linkedStudents = 0;
    let ambiguousStudents = 0;
    let linkedSubmissions = 0;

    for (const course of courses) {
      const students = await listGoogleClassroomStudents(connection, course.classroomCourseId);
      fetchedStudents += students.length;
      const externalIds = students.map(student => student.userId);
      const existing = externalIds.length
        ? await db.select({ studentGoogleUserId: googleClassroomRosters.studentGoogleUserId })
          .from(googleClassroomRosters)
          .where(and(eq(googleClassroomRosters.classroomCourseId, course.id), inArray(googleClassroomRosters.studentGoogleUserId, externalIds)))
        : [];
      const existingIds = new Set(existing.map(student => student.studentGoogleUserId));
      const courseWork = await db.query.googleClassroomCoursework.findMany({ where: eq(googleClassroomCoursework.classroomCourseId, course.id) });
      const courseworkIds = courseWork.map(item => item.id);

      for (const student of students) {
        const googleEmail = student.profile?.emailAddress?.trim().toLowerCase() || null;
        const matches = googleEmail ? usersByEmail.get(googleEmail) || [] : [];
        const localUserId = matches.length === 1 ? matches[0] : null;
        if (localUserId) linkedStudents += 1;
        if (matches.length > 1) ambiguousStudents += 1;

        await db.insert(googleClassroomRosters).values({
          classroomCourseId: course.id,
          studentGoogleUserId: student.userId,
          googleEmail,
          studentName: student.profile?.name?.fullName || null,
          localUserId,
          state: "ACTIVE",
          lastSyncedAt: now,
          createdAt: now,
          updatedAt: now,
        }).onConflictDoUpdate({
          target: [googleClassroomRosters.classroomCourseId, googleClassroomRosters.studentGoogleUserId],
          set: {
            googleEmail,
            studentName: student.profile?.name?.fullName || null,
            localUserId,
            state: "ACTIVE",
            lastSyncedAt: now,
            updatedAt: now,
          },
        });

        if (localUserId && courseworkIds.length) {
          const updated = await db.update(googleClassroomSubmissions)
            .set({ localUserId, updatedAt: now })
            .where(and(eq(googleClassroomSubmissions.studentGoogleUserId, student.userId), inArray(googleClassroomSubmissions.courseworkId, courseworkIds)))
            .returning({ id: googleClassroomSubmissions.id });
          linkedSubmissions += updated.length;
        }
      }

      createdRoster += students.filter(student => !existingIds.has(student.userId)).length;
      updatedRoster += students.filter(student => existingIds.has(student.userId)).length;
    }

    await db.update(googleClassroomConnections).set({ status: "active", lastError: null, updatedAt: now }).where(eq(googleClassroomConnections.id, connection.id));
    return NextResponse.json({
      success: true,
      message: "Participantes sincronizados e submissions vinculadas.",
      stats: { syncedCourses: courses.length, fetchedStudents, createdRoster, updatedRoster, linkedStudents, ambiguousStudents, linkedSubmissions, timestamp: now.toISOString() },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    await markClassroomConnectionError(connection.id, error);
    if (error instanceof GoogleClassroomApiError) return NextResponse.json({ success: false, code: error.code, error: error.message }, { status: error.status });
    console.error("Erro ao sincronizar roster do Google Classroom:", error);
    return NextResponse.json({ success: false, code: "ROSTER_SYNC_ERROR", error: "Não foi possível sincronizar os participantes do Classroom." }, { status: 502 });
  }
}
