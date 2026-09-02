import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { and, eq, sql } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { googleClassroomConnections, googleClassroomCourses } from "@/drizzle/schema";

export const dynamic = "force-dynamic";

function sessionUserId(session: Session | null) {
  const id = Number(session?.user?.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = sessionUserId(session);
  if (!userId) return NextResponse.json({ connected: false, code: "NOT_AUTHENTICATED" }, { status: 401 });

  const connection = await db.query.googleClassroomConnections.findFirst({
    where: eq(googleClassroomConnections.userId, userId),
    columns: {
      id: true,
      googleEmail: true,
      scopes: true,
      status: true,
      tokenExpiresAt: true,
      lastError: true,
      updatedAt: true,
    },
  });

  if (!connection) {
    return NextResponse.json({ connected: false, code: "NOT_CONNECTED" }, { headers: { "Cache-Control": "no-store" } });
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(googleClassroomCourses)
    .where(and(eq(googleClassroomCourses.connectionId, connection.id), sql`${googleClassroomCourses.archivedAt} IS NULL`));

  const expired = connection.tokenExpiresAt ? connection.tokenExpiresAt.getTime() <= Date.now() : false;
  const connected = connection.status === "active" && !expired;

  return NextResponse.json({
    connected,
    code: connected ? "CONNECTED" : expired ? "TOKEN_EXPIRED" : "CONNECTION_ERROR",
    account: {
      email: connection.googleEmail,
      scopes: connection.scopes.split(/\s+/).filter(Boolean),
      courseCount: Number(count || 0),
      updatedAt: connection.updatedAt,
      tokenExpiresAt: connection.tokenExpiresAt,
      lastError: connection.lastError,
    },
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  const userId = sessionUserId(session);
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  await db
    .update(googleClassroomConnections)
    .set({
      status: "revoked",
      accessTokenEncrypted: null,
      refreshTokenEncrypted: null,
      lastError: null,
      updatedAt: new Date(),
    })
    .where(eq(googleClassroomConnections.userId, userId));

  return NextResponse.json({ success: true, connected: false });
}
