import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { lessonNotes } from "@/drizzle/schema";

function userIdFromSession(session: { user?: { id?: string | null } } | null) { const value = Number(session?.user?.id); return Number.isInteger(value) && value > 0 ? value : null; }
function lessonIdFrom(request: Request, body?: { lessonId?: number }) { const raw = body?.lessonId ?? new URL(request.url).searchParams.get("lessonId"); const value = Number(raw); return Number.isInteger(value) && value > 0 ? value : null; }

export async function GET(request: Request) {
  const userId = userIdFromSession(await getServerSession(authOptions));
  const lessonId = lessonIdFrom(request);
  if (!userId) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  if (lessonId) {
    const note = await db.query.lessonNotes.findFirst({ where: and(eq(lessonNotes.userId, userId), eq(lessonNotes.lessonId, lessonId)) });
    return NextResponse.json({ note: note || null });
  }
  const notes = await db.query.lessonNotes.findMany({ where: eq(lessonNotes.userId, userId), with: { lesson: true }, orderBy: desc(lessonNotes.updatedAt) });
  return NextResponse.json({ notes });
}

export async function PUT(request: Request) {
  const userId = userIdFromSession(await getServerSession(authOptions));
  const body = await request.json();
  const lessonId = lessonIdFrom(request, body);
  const noteText = String(body.note || "").trim();
  if (!userId || !lessonId) return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  if (noteText.length > 10000) return NextResponse.json({ error: "A anotação excede o limite de 10.000 caracteres." }, { status: 400 });
  const existing = await db.query.lessonNotes.findFirst({ where: and(eq(lessonNotes.userId, userId), eq(lessonNotes.lessonId, lessonId)) });
  if (existing) { const [updated] = await db.update(lessonNotes).set({ note: noteText, updatedAt: new Date() }).where(eq(lessonNotes.id, existing.id)).returning(); return NextResponse.json({ note: updated }); }
  const [created] = await db.insert(lessonNotes).values({ userId, lessonId, note: noteText }).returning();
  return NextResponse.json({ note: created }, { status: 201 });
}

export async function DELETE(request: Request) {
  const userId = userIdFromSession(await getServerSession(authOptions));
  const lessonId = lessonIdFrom(request);
  if (!userId || !lessonId) return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  await db.delete(lessonNotes).where(and(eq(lessonNotes.userId, userId), eq(lessonNotes.lessonId, lessonId)));
  return NextResponse.json({ removed: true });
}
