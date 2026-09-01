import { NextResponse } from "next/server";
import { isAuthorizedClassroomCron } from "@/lib/classroom-cron-auth";

export const dynamic = "force-dynamic";

const SYNC_ROUTES = [
  "/api/admin/classroom-sync",
  "/api/admin/classroom-coursework-sync",
  "/api/admin/classroom-submissions-sync",
  "/api/admin/classroom-roster-sync",
] as const;

export async function GET(request: Request) {
  if (!isAuthorizedClassroomCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = process.env.CLASSROOM_SYNC_USER_ID;
  if (!userId) {
    return NextResponse.json({ error: "CLASSROOM_SYNC_USER_ID não está configurado" }, { status: 500 });
  }

  const results: Array<{ route: string; status: number; body: unknown }> = [];
  for (const route of SYNC_ROUTES) {
    const response = await fetch(new URL(route, request.url), {
      method: "POST",
      headers: {
        Authorization: request.headers.get("authorization") || "",
        "x-classroom-user-id": userId,
      },
      cache: "no-store",
    });
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = { error: "Resposta inválida do sincronizador" };
    }
    results.push({ route, status: response.status, body });
    if (!response.ok) {
      return NextResponse.json({ success: false, failedRoute: route, results }, { status: 502 });
    }
  }

  return NextResponse.json({ success: true, results, timestamp: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
