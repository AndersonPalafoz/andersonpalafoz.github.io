import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { desc, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db, getUserByEmail } from "@/lib/db";
import { lessonNotes, lessons } from "@/drizzle/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404, headers: { "Cache-Control": "no-store" } });

  const notes = await db.select({ id: lessonNotes.id, lessonId: lessonNotes.lessonId, note: lessonNotes.note, deletedByAdminAt: lessonNotes.deletedByAdminAt, deletedByAdminEmail: lessonNotes.deletedByAdminEmail, lessonTitle: lessons.title, createdAt: lessonNotes.createdAt, updatedAt: lessonNotes.updatedAt })
    .from(lessonNotes)
    .innerJoin(lessons, eq(lessonNotes.lessonId, lessons.id))
    .where(eq(lessonNotes.userId, user.id))
    .orderBy(desc(lessonNotes.updatedAt))
    .limit(100);

  return NextResponse.json({
    notes: notes.map((item) => ({
      ...item,
      note: item.deletedByAdminAt ? "" : item.note,
    })),
  }, { headers: { "Cache-Control": "no-store" } });
}
