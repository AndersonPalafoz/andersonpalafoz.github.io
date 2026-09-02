import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { googleClassroomConnections } from "@/drizzle/schema";
import { isAuthorizedClassroomCron } from "@/lib/classroom-cron-auth";

export const dynamic = "force-dynamic";

const READ_SYNC_ROUTES = [
  "/api/admin/classroom-sync",
  "/api/admin/classroom-coursework-sync",
  "/api/admin/classroom-submissions-sync",
] as const;
const TEACHER_SYNC_ROUTES = [...READ_SYNC_ROUTES, "/api/admin/classroom-roster-sync"] as const;

type SyncResult = { route: string; status: number; body: unknown };

export async function GET(request: Request) {
  if (!isAuthorizedClassroomCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connections = await db.query.googleClassroomConnections.findMany({
    where: eq(googleClassroomConnections.status, "active"),
    columns: { id: true, userId: true, authorizedRole: true },
  });
  const summary: Array<{ connectionId: number; userId: number; authorizedRole: string; success: boolean; results: SyncResult[] }> = [];

  for (const connection of connections) {
    const routes = connection.authorizedRole === "student" ? READ_SYNC_ROUTES : TEACHER_SYNC_ROUTES;
    const results: SyncResult[] = [];
    let failed = false;
    const startedAt = new Date();
    await db.update(googleClassroomConnections).set({ lastSyncStatus: "running", lastSyncAt: startedAt, updatedAt: startedAt }).where(eq(googleClassroomConnections.id, connection.id));

    for (const route of routes) {
      const response = await fetch(new URL(route, request.url), {
        method: "POST",
        headers: { Authorization: request.headers.get("authorization") || "", "x-classroom-user-id": String(connection.userId) },
        cache: "no-store",
      });
      let body: unknown;
      try { body = await response.json(); } catch { body = { error: "Resposta inválida do sincronizador" }; }
      results.push({ route, status: response.status, body });
      if (!response.ok) { failed = true; break; }
    }

    const finishedAt = new Date();
    await db.update(googleClassroomConnections).set({
      lastSyncStatus: failed ? "error" : "success",
      lastSyncAt: finishedAt,
      lastError: failed ? "Uma etapa da sincronização diária falhou." : null,
      status: failed ? "error" : "active",
      updatedAt: finishedAt,
    }).where(eq(googleClassroomConnections.id, connection.id));
    summary.push({ connectionId: connection.id, userId: connection.userId, authorizedRole: connection.authorizedRole, success: !failed, results });
  }

  const failedConnections = summary.filter(item => !item.success).length;
  return NextResponse.json({
    success: failedConnections === 0,
    processedConnections: summary.length,
    failedConnections,
    summary,
    timestamp: new Date().toISOString(),
  }, { status: failedConnections ? 207 : 200, headers: { "Cache-Control": "no-store" } });
}
