import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { and, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db, getUserByEmail } from "@/lib/db";
import { lessonNotes } from "@/drizzle/schema";

type StoredMediaNote = { id: string; time: number; timeFormatted: string; text: string };

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

function parseNotes(raw: string | null | undefined, fallbackId: number): StoredMediaNote[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed.filter((item): item is StoredMediaNote => Boolean(item && typeof item === "object" && typeof (item as StoredMediaNote).id === "string" && typeof (item as StoredMediaNote).text === "string"));
  } catch {
    return [{ id: `legacy-${fallbackId}`, time: 0, timeFormatted: "0:00", text: raw }];
  }
  return [{ id: `legacy-${fallbackId}`, time: 0, timeFormatted: "0:00", text: raw }];
}

async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return getUserByEmail(session.user.email);
}

function lessonIdFrom(request: Request, body?: { lessonId?: number }) {
  const value = Number(body?.lessonId ?? new URL(request.url).searchParams.get("lessonId"));
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function GET(request: Request) {
  const user = await getUser();
  const lessonId = lessonIdFrom(request);
  if (!user || !lessonId) return NextResponse.json({ error: "Autenticação e aula são obrigatórias." }, { status: 400 });
  const existing = await db.query.lessonNotes.findFirst({ where: and(eq(lessonNotes.userId, user.id), eq(lessonNotes.lessonId, lessonId)) });
  return NextResponse.json({ notes: parseNotes(existing?.note, existing?.id ?? lessonId) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const user = await getUser();
  const body = await request.json().catch(() => ({})) as { lessonId?: number; time?: number; text?: string };
  const lessonId = lessonIdFrom(request, body);
  const text = String(body.text || "").trim();
  const time = Number(body.time);
  if (!user || !lessonId || !text || !Number.isFinite(time) || time < 0) return NextResponse.json({ error: "Aula, texto e momento válido são obrigatórios." }, { status: 400 });
  if (text.length > 2000) return NextResponse.json({ error: "A anotação excede 2.000 caracteres." }, { status: 400 });

  const existing = await db.query.lessonNotes.findFirst({ where: and(eq(lessonNotes.userId, user.id), eq(lessonNotes.lessonId, lessonId)) });
  const notes = parseNotes(existing?.note, existing?.id ?? lessonId);
  const newNote: StoredMediaNote = { id: crypto.randomUUID(), time, timeFormatted: formatTime(time), text };
  const serialized = JSON.stringify([...notes, newNote]);
  if (existing) await db.update(lessonNotes).set({ note: serialized, updatedAt: new Date() }).where(eq(lessonNotes.id, existing.id));
  else await db.insert(lessonNotes).values({ userId: user.id, lessonId, note: serialized });
  return NextResponse.json({ note: newNote }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getUser();
  const body = await request.json().catch(() => ({})) as { lessonId?: number; id?: string };
  const lessonId = lessonIdFrom(request, body);
  const noteId = body.id || new URL(request.url).searchParams.get("id");
  if (!user || !lessonId || !noteId) return NextResponse.json({ error: "Aula e anotação são obrigatórias." }, { status: 400 });
  const existing = await db.query.lessonNotes.findFirst({ where: and(eq(lessonNotes.userId, user.id), eq(lessonNotes.lessonId, lessonId)) });
  if (!existing) return NextResponse.json({ removed: false });
  const notes = parseNotes(existing.note, existing.id).filter((note) => note.id !== noteId);
  if (notes.length === 0) await db.delete(lessonNotes).where(eq(lessonNotes.id, existing.id));
  else await db.update(lessonNotes).set({ note: JSON.stringify(notes), updatedAt: new Date() }).where(eq(lessonNotes.id, existing.id));
  return NextResponse.json({ removed: true });
}
