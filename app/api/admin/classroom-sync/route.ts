import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { googleClassroomConnections, googleClassroomCourses } from "@/drizzle/schema";
import { listGoogleClassroomCourses, GoogleClassroomApiError, markClassroomConnectionError } from "@/lib/google-classroom-api";
import { filterPlatformClassroomCourses } from "@/lib/google-classroom-filter";
import { getClassroomRouteIdentity, canSyncClassroomRole, unauthorizedClassroomResponse } from "@/lib/classroom-route-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const identity = await getClassroomRouteIdentity(request);
  if (!identity) return unauthorizedClassroomResponse();
  const userId = identity.userId;

  const connection = await db.query.googleClassroomConnections.findFirst({
    where: and(eq(googleClassroomConnections.userId, userId), eq(googleClassroomConnections.status, "active")),
  });
  if (!connection || !canSyncClassroomRole(identity.role, connection.authorizedRole, "read")) {
    return NextResponse.json({
      success: false,
      code: "NOT_CONNECTED",
      error: "Conecte uma conta do Google Classroom antes de importar cursos.",
    }, { status: 409 });
  }

  try {
    const fetchedCourses = await listGoogleClassroomCourses(connection);
    const courses = filterPlatformClassroomCourses(fetchedCourses);
    const externalIds = courses.map(course => course.id);
    const existing = externalIds.length
      ? await db.select({ classroomCourseId: googleClassroomCourses.classroomCourseId })
        .from(googleClassroomCourses)
        .where(and(eq(googleClassroomCourses.connectionId, connection.id), inArray(googleClassroomCourses.classroomCourseId, externalIds)))
      : [];
    const existingIds = new Set(existing.map(course => course.classroomCourseId));
    const now = new Date();

    for (const course of courses) {
      const state = course.courseState || "ACTIVE";
      await db.insert(googleClassroomCourses).values({
        connectionId: connection.id,
        classroomCourseId: course.id,
        name: course.name,
        section: course.section || null,
        description: course.description || null,
        state,
        ownerGoogleUserId: course.ownerId || null,
        enrollmentCode: course.enrollmentCode || null,
        lastSyncedAt: now,
        archivedAt: state === "ARCHIVED" ? now : null,
        createdAt: now,
        updatedAt: now,
      }).onConflictDoUpdate({
        target: [googleClassroomCourses.connectionId, googleClassroomCourses.classroomCourseId],
        set: {
          name: course.name,
          section: course.section || null,
          description: course.description || null,
          state,
          ownerGoogleUserId: course.ownerId || null,
          enrollmentCode: course.enrollmentCode || null,
          lastSyncedAt: now,
          archivedAt: state === "ARCHIVED" ? now : null,
          updatedAt: now,
        },
      });
    }

    await db.update(googleClassroomConnections)
      .set({ status: "active", lastError: null, updatedAt: now })
      .where(eq(googleClassroomConnections.id, connection.id));

    return NextResponse.json({
      success: true,
      message: "Cursos do Google Classroom importados com sucesso.",
      stats: {
        fetchedCourses: fetchedCourses.length,
        importedCourses: courses.length,
        createdCourses: courses.filter(course => !existingIds.has(course.id)).length,
        updatedCourses: courses.filter(course => existingIds.has(course.id)).length,
        filteredCourses: fetchedCourses.length - courses.length,
        timestamp: now.toISOString(),
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    await markClassroomConnectionError(connection.id, error);
    if (error instanceof GoogleClassroomApiError) {
      return NextResponse.json({ success: false, code: error.code, error: error.message }, { status: error.status });
    }
    console.error("Erro ao importar cursos do Google Classroom:", error);
    return NextResponse.json({ success: false, code: "SYNC_ERROR", error: "Não foi possível importar os cursos do Classroom." }, { status: 502 });
  }
}
