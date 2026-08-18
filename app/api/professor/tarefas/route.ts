import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { activities, courses, users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "professor" && session.user.role !== "admin")) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    const body = await request.json();
    const title = String(body.title || "").trim();
    const courseId = Number(body.courseId);
    const type = String(body.type || "").trim();
    if (!title || !Number.isInteger(courseId) || courseId <= 0 || !type) return NextResponse.json({ error: "Título, curso e tipo de atividade são obrigatórios." }, { status: 400 });

    if (session.user.role === "professor") {
      const teacher = session.user.email ? await db.query.users.findFirst({ where: eq(users.email, session.user.email) }) : null;
      const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
      const belongs = course && teacher && (course.instructor === "Anderson Palafoz" || course.instructor === teacher.name);
      if (!belongs) return NextResponse.json({ error: "Você não tem acesso a este curso." }, { status: 403 });
    }

    const metadata = {
      ...(typeof body.tag === "string" && body.tag.trim() ? { tag: body.tag.trim() } : {}),
      status: "pending" as const,
      ...(Array.isArray(body.subtasks) ? { subtasks: body.subtasks } : {}),
      ...(Array.isArray(body.attachments) ? { attachments: body.attachments } : {}),
      ...(Number.isFinite(Number(body.order)) ? { order: Number(body.order) } : {}),
    };
    const [newActivity] = await db.insert(activities).values({ title, description: body.description ? String(body.description).trim() : null, courseId, type: type as any, dueDate: body.dueDate ? new Date(body.dueDate) : null, metadata }).returning();
    return NextResponse.json({ success: true, activity: newActivity }, { status: 201 });
  } catch (error) { console.error("Erro ao criar tarefa:", error); return NextResponse.json({ error: "Erro interno ao criar tarefa." }, { status: 500 }); }
}
