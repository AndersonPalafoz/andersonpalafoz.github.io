import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { activities, courses, users } from "@/drizzle/schema";
import { desc, eq } from "drizzle-orm";

type TaskMetadata = { tag?: string; status?: "pending" | "completed"; subtasks?: Array<{ id: string; title: string; completed: boolean }>; attachments?: Array<{ id: string; name: string; url: string }>; order?: number };

function canManage(role?: string | null) { return role === "professor" || role === "admin"; }
function serializeActivity(activity: any) {
  const metadata = (activity.metadata || {}) as TaskMetadata;
  return { ...activity, tag: metadata.tag ?? null, status: metadata.status ?? null, subtasks: metadata.subtasks ?? null, attachments: metadata.attachments ?? null, order: metadata.order ?? null };
}

async function getAccess(courseId?: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canManage(session.user.role)) return { response: NextResponse.json({ error: "Não autorizado." }, { status: 403 }) };
  if (session.user.role === "admin") return { session };
  const teacher = session.user.email ? await db.query.users.findFirst({ where: eq(users.email, session.user.email) }) : null;
  if (!teacher || teacher.role !== "professor") return { response: NextResponse.json({ error: "Professor não encontrado." }, { status: 403 }) };
  if (courseId !== undefined) {
    const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
    const belongs = course && (course.instructor === "Anderson Palafoz" || course.instructor === teacher.name);
    if (!belongs) return { response: NextResponse.json({ error: "Você não tem acesso a este curso." }, { status: 403 }) };
  }
  return { session, teacher };
}

export async function GET() {
  try {
    const access = await getAccess();
    if (access.response) return access.response;
    const allActivities = await db.query.activities.findMany({ with: { course: true }, orderBy: [desc(activities.createdAt)] });
    if (access.session?.user?.role === "admin") return NextResponse.json({ activities: allActivities.map(serializeActivity) });
    const teacherName = access.teacher?.name;
    const filtered = allActivities.filter((activity) => activity.course && (activity.course.instructor === "Anderson Palafoz" || activity.course.instructor === teacherName));
    return NextResponse.json({ activities: filtered.map(serializeActivity) });
  } catch (error) { console.error("Erro ao carregar atividades:", error); return NextResponse.json({ error: "Não foi possível carregar as atividades." }, { status: 500 }); }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const activityId = Number(body.id);
    if (!Number.isInteger(activityId) || activityId <= 0) return NextResponse.json({ error: "ID da atividade é obrigatório." }, { status: 400 });
    const existing = await db.query.activities.findFirst({ where: eq(activities.id, activityId) });
    if (!existing) return NextResponse.json({ error: "Atividade não encontrada." }, { status: 404 });
    const access = await getAccess(existing.courseId);
    if (access.response) return access.response;
    const current = (existing.metadata || {}) as TaskMetadata;
    const nextMetadata: TaskMetadata = { ...current, ...(body.tag !== undefined ? { tag: String(body.tag).trim() || undefined } : {}), ...(body.status !== undefined ? { status: body.status === "completed" ? "completed" : "pending" } : {}), ...(body.subtasks !== undefined ? { subtasks: body.subtasks } : {}), ...(body.attachments !== undefined ? { attachments: body.attachments } : {}), ...(body.order !== undefined ? { order: Number(body.order) } : {}) };
    const [updated] = await db.update(activities).set({ title: body.title !== undefined ? String(body.title).trim() : undefined, description: body.description !== undefined ? body.description : undefined, dueDate: body.dueDate === null || body.dueDate === "" ? null : body.dueDate !== undefined ? new Date(body.dueDate) : undefined, type: body.type || undefined, metadata: nextMetadata }).where(eq(activities.id, activityId)).returning();
    return NextResponse.json({ success: true, activity: serializeActivity(updated) });
  } catch (error) { console.error("Erro ao atualizar atividade:", error); return NextResponse.json({ error: "Não foi possível atualizar a atividade." }, { status: 500 }); }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "ID da atividade é obrigatório." }, { status: 400 });
    const existing = await db.query.activities.findFirst({ where: eq(activities.id, id) });
    if (!existing) return NextResponse.json({ error: "Atividade não encontrada." }, { status: 404 });
    const access = await getAccess(existing.courseId);
    if (access.response) return access.response;
    await db.delete(activities).where(eq(activities.id, id));
    return NextResponse.json({ success: true });
  } catch (error) { console.error("Erro ao excluir atividade:", error); return NextResponse.json({ error: "Não foi possível excluir a atividade." }, { status: 500 }); }
}
