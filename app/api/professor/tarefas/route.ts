import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { activities } from "@/drizzle/schema";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "professor" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, courseId, type, dueDate } = body;

    if (!title || !courseId || !type) {
      return NextResponse.json({ error: "Título, curso e tipo de atividade são obrigatórios." }, { status: 400 });
    }

    const newActivity = await db.insert(activities).values({
      title: title.trim(),
      description: description ? description.trim() : null,
      courseId: Number(courseId),
      type,
      dueDate: dueDate ? new Date(dueDate) : null,
    }).returning();

    return NextResponse.json({ success: true, activity: newActivity[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json({ error: "Erro interno ao criar tarefa." }, { status: 500 });
  }
}
