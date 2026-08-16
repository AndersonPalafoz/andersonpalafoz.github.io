import { NextResponse } from "next/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, getUserByEmail } from "@/lib/db";
import { notifications } from "@/drizzle/schema";

async function currentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return getUserByEmail(session.user.email);
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const items = await db.select().from(notifications).where(eq(notifications.userId, user.id)).orderBy(desc(notifications.createdAt)).limit(50);
  return NextResponse.json({ notifications: items, unreadCount: items.filter((item) => !item.readAt).length });
}

export async function PATCH(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const notificationId = Number(body.id);
  const where = body.all === true
    ? and(eq(notifications.userId, user.id), isNull(notifications.readAt))
    : and(eq(notifications.userId, user.id), eq(notifications.id, notificationId));
  if (body.all !== true && !Number.isInteger(notificationId)) return NextResponse.json({ error: "Notificação inválida" }, { status: 400 });
  await db.update(notifications).set({ readAt: new Date() }).where(where);
  return NextResponse.json({ success: true });
}
