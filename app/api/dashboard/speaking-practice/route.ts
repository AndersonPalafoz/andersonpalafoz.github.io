import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { and, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db, getUserByEmail } from "@/lib/db";
import { activities, enrollments } from "@/drizzle/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404, headers: { "Cache-Control": "no-store" } });

  const rows = await db.select({ id: activities.id, courseId: activities.courseId, title: activities.title, description: activities.description })
    .from(activities)
    .innerJoin(enrollments, eq(enrollments.courseId, activities.courseId))
    .where(and(eq(enrollments.userId, user.id), eq(activities.type, "speaking")))
    .limit(50);

  return NextResponse.json({ activities: rows }, { headers: { "Cache-Control": "no-store" } });
}
