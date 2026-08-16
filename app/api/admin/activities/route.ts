import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { activities, courses } from "@/drizzle/schema";

async function ensureTeacherOrAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  if (session.user.role !== "admin" && session.user.role !== "professor") return null;
  return session;
}

export async function GET() {
  const session = await ensureTeacherOrAdmin();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const rows = await db.select({
    id: activities.id,
    courseId: activities.courseId,
    title: activities.title,
    description: activities.description,
    type: activities.type,
    dueDate: activities.dueDate,
    createdAt: activities.createdAt,
    courseTitle: courses.title,
  }).from(activities).innerJoin(courses, eq(activities.courseId, courses.id)).orderBy(desc(activities.createdAt));

  return NextResponse.json({ activities: rows });
}

export async function POST(request: NextRequest) {
  const session = await ensureTeacherOrAdmin();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  try {
    const body = await request.json() as {
      courseId?: number;
      title?: string;
      description?: string;
      type?: "quiz" | "exercise" | "assignment" | "speaking";
      dueDate?: string;
    };
    if (!body.courseId || !body.title?.trim() || !body.description?.trim() || !body.type) {
      return NextResponse.json({ error: "Curso, título, enunciado e tipo são obrigatórios." }, { status: 400 });
    }

    const created = await db.insert(activities).values({
      courseId: body.courseId,
      title: body.title.trim(),
      description: body.description,
      type: body.type,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    }).returning();

    return NextResponse.json({ activity: created[0] }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar avaliação:", error);
    return NextResponse.json({ error: "Não foi possível salvar a avaliação." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await ensureTeacherOrAdmin();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  await db.delete(activities).where(and(eq(activities.id, id)));
  return NextResponse.json({ ok: true });
}
