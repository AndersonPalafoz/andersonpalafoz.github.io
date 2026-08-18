import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { and, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db, getUserByEmail } from "@/lib/db";
import { activities, classSessions, enrollments, userActivityProgress } from "@/drizzle/schema";
import { fetchGoogleCalendarEvents, getGoogleCalendarAccess, GoogleCalendarError } from "@/lib/google-calendar-api";

export const dynamic = "force-dynamic";

async function currentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return getUserByEmail(session.user.email);
}

function parseWindow(request: NextRequest) {
  const now = new Date();
  const fromParam = request.nextUrl.searchParams.get("from");
  const toParam = request.nextUrl.searchParams.get("to");
  const from = fromParam ? new Date(fromParam) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const to = toParam ? new Date(toParam) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 6, 1));
  return { from: Number.isNaN(from.getTime()) ? now : from, to: Number.isNaN(to.getTime()) ? new Date(now.getTime() + 180 * 86400000) : to };
}

async function getDatabaseEvents(userId: number, from: Date, to: Date) {
  const enrollmentsForUser = await db.query.enrollments.findMany({
    where: eq(enrollments.userId, userId),
    columns: { courseId: true },
  });
  const courseIds = [...new Set(enrollmentsForUser.map((item) => item.courseId))];
  if (courseIds.length === 0) return [];

  const [activityRows, sessionRows] = await Promise.all([
    db.select({ id: activities.id, title: activities.title, dueDate: activities.dueDate, courseId: activities.courseId })
      .from(activities)
      .where(and(inArray(activities.courseId, courseIds), isNotNull(activities.dueDate)))
      .orderBy(desc(activities.dueDate)),
    db.select({ id: classSessions.id, title: classSessions.title, scheduledAt: classSessions.scheduledAt, durationMinutes: classSessions.durationMinutes, courseId: classSessions.courseId })
      .from(classSessions)
      .where(and(inArray(classSessions.courseId, courseIds), eq(classSessions.status, "scheduled")))
      .orderBy(desc(classSessions.scheduledAt)),
  ]);

  const activityIds = activityRows.map((item) => item.id);
  const progressRows = activityIds.length > 0
    ? await db.query.userActivityProgress.findMany({ where: and(eq(userActivityProgress.userId, userId), inArray(userActivityProgress.activityId, activityIds)), columns: { activityId: true, status: true } })
    : [];
  const statusByActivity = new Map(progressRows.map((item) => [item.activityId, item.status]));

  const activityEvents = activityRows.flatMap((item) => {
    if (!item.dueDate || item.dueDate < from || item.dueDate > to) return [];
    const status = statusByActivity.get(item.id);
    return [{
      id: `db-activity-${item.id}`,
      title: item.title,
      start: item.dueDate.toISOString(),
      end: item.dueDate.toISOString(),
      status: status === "completed" ? "Concluída" : status === "in_progress" ? "Em andamento" : "Pendente",
      source: "database" as const,
      kind: "activity" as const,
      courseId: item.courseId,
    }];
  });

  const sessionEvents = sessionRows.flatMap((item) => {
    if (!item.scheduledAt || item.scheduledAt < from || item.scheduledAt > to) return [];
    const end = new Date(item.scheduledAt.getTime() + (item.durationMinutes ?? 60) * 60000);
    return [{
      id: `db-session-${item.id}`,
      title: item.title,
      start: item.scheduledAt.toISOString(),
      end: end.toISOString(),
      status: "Aula agendada",
      source: "database" as const,
      kind: "class_session" as const,
      courseId: item.courseId,
    }];
  });

  return [...activityEvents, ...sessionEvents].sort((a, b) => a.start.localeCompare(b.start));
}

async function buildCalendarPayload(request: NextRequest, userId: number) {
  const { from, to } = parseWindow(request);
  const databaseEvents = await getDatabaseEvents(userId, from, to);
  let googleEvents: Awaited<ReturnType<typeof fetchGoogleCalendarEvents>> = [];
  let googleStatus: { connected: boolean; message?: string; code?: string } = { connected: false, message: "Conta Google não conectada a esta sessão." };

  try {
    const { accessToken } = await getGoogleCalendarAccess(request);
    googleEvents = await fetchGoogleCalendarEvents(accessToken, from, to);
    googleStatus = { connected: true };
  } catch (error) {
    if (error instanceof GoogleCalendarError) {
      googleStatus = { connected: false, code: error.code, message: error.message };
    } else {
      googleStatus = { connected: false, code: "API_ERROR", message: "Não foi possível consultar o Google Calendar." };
    }
  }

  return {
    eventos: [...databaseEvents, ...googleEvents.map((event) => ({ ...event, status: "Evento do Google Calendar", kind: "google" as const }))].sort((a, b) => a.start.localeCompare(b.start)),
    sources: { database: databaseEvents.length, google: googleEvents.length },
    google: googleStatus,
    window: { from: from.toISOString(), to: to.toISOString() },
    fetchedAt: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json(await buildCalendarPayload(request, user.id), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Erro ao carregar eventos do calendário:", error);
    return NextResponse.json({ error: "Erro interno ao carregar calendário." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    const payload = await buildCalendarPayload(request, user.id);
    return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Erro ao atualizar calendário:", error);
    return NextResponse.json({ error: "Erro interno ao atualizar calendário." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
