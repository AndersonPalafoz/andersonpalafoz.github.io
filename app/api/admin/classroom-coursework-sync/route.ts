import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { and, eq, inArray } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { googleClassroomConnections, googleClassroomCourses, googleClassroomCoursework } from "@/drizzle/schema";
import { classroomDueDate, listGoogleClassroomCoursework, GoogleClassroomApiError, markClassroomConnectionError } from "@/lib/google-classroom-api";
import { cronUserId } from "@/lib/classroom-cron-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const scheduledUserId = cronUserId(request);
  const session = scheduledUserId ? null : await getServerSession(authOptions);
  if (!scheduledUserId && (!session?.user || session.user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = scheduledUserId ?? Number(session?.user?.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: "Sessão administrativa inválida" }, { status: 401 });
  }

  const connection = await db.query.googleClassroomConnections.findFirst({
    where: and(eq(googleClassroomConnections.userId, userId), eq(googleClassroomConnections.status, "active")),
  });
  if (!connection) {
    return NextResponse.json({ success: false, code: "NOT_CONNECTED", error: "Conecte o Google Classroom antes de importar atividades." }, { status: 409 });
  }

  const syncedCourses = await db.query.googleClassroomCourses.findMany({
    where: and(eq(googleClassroomCourses.connectionId, connection.id), eq(googleClassroomCourses.state, "ACTIVE")),
  });
  if (!syncedCourses.length) {
    return NextResponse.json({ success: false, code: "NO_COURSES", error: "Nenhum curso Classroom sincronizado está disponível para importar atividades." }, { status: 409 });
  }

  try {
    let fetchedCoursework = 0;
    let createdCoursework = 0;
    let updatedCoursework = 0;
    const now = new Date();

    for (const course of syncedCourses) {
      const items = await listGoogleClassroomCoursework(connection, course.classroomCourseId);
      fetchedCoursework += items.length;
      const externalIds = items.map(item => item.id);
      const existing = externalIds.length
        ? await db.select({ classroomCourseworkId: googleClassroomCoursework.classroomCourseworkId })
          .from(googleClassroomCoursework)
          .where(and(eq(googleClassroomCoursework.classroomCourseId, course.id), inArray(googleClassroomCoursework.classroomCourseworkId, externalIds)))
        : [];
      const existingIds = new Set(existing.map(item => item.classroomCourseworkId));

      for (const item of items) {
        const state = item.state || "PUBLISHED";
        const archivedAt = state === "DELETED" ? now : null;
        await db.insert(googleClassroomCoursework).values({
          classroomCourseId: course.id,
          classroomCourseworkId: item.id,
          title: item.title,
          description: item.description || null,
          workType: item.workType || null,
          state,
          dueDate: classroomDueDate(item),
          maxPoints: item.maxPoints === undefined ? null : String(item.maxPoints),
          topicId: item.topicId || null,
          alternateLink: item.alternateLink || null,
          materials: item.materials || null,
          lastSyncedAt: now,
          archivedAt,
          createdAt: now,
          updatedAt: now,
        }).onConflictDoUpdate({
          target: [googleClassroomCoursework.classroomCourseId, googleClassroomCoursework.classroomCourseworkId],
          set: {
            title: item.title,
            description: item.description || null,
            workType: item.workType || null,
            state,
            dueDate: classroomDueDate(item),
            maxPoints: item.maxPoints === undefined ? null : String(item.maxPoints),
            topicId: item.topicId || null,
            alternateLink: item.alternateLink || null,
            materials: item.materials || null,
            lastSyncedAt: now,
            archivedAt,
            updatedAt: now,
          },
        });
      }

      createdCoursework += items.filter(item => !existingIds.has(item.id)).length;
      updatedCoursework += items.filter(item => existingIds.has(item.id)).length;
    }

    await db.update(googleClassroomConnections)
      .set({ status: "active", lastError: null, updatedAt: now })
      .where(eq(googleClassroomConnections.id, connection.id));

    return NextResponse.json({
      success: true,
      message: "Atividades do Google Classroom importadas com sucesso.",
      stats: {
        syncedCourses: syncedCourses.length,
        fetchedCoursework,
        createdCoursework,
        updatedCoursework,
        timestamp: now.toISOString(),
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    await markClassroomConnectionError(connection.id, error);
    if (error instanceof GoogleClassroomApiError) {
      return NextResponse.json({ success: false, code: error.code, error: error.message }, { status: error.status });
    }
    console.error("Erro ao importar atividades do Google Classroom:", error);
    return NextResponse.json({ success: false, code: "COURSEWORK_SYNC_ERROR", error: "Não foi possível importar as atividades do Classroom." }, { status: 502 });
  }
}
