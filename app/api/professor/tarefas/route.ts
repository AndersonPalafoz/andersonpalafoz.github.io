import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { activities, users } from "@/drizzle/schema";
import { canManageCourse, type AdminAuthSession } from "@/lib/admin-auth";
import {
  normalizeAcademicId,
  resolveAcademicContext,
  resolveAndAuthorizeAcademicContext,
  type AcademicContextInput,
} from "@/lib/academic-context";

 type TaskMetadata = {
  tag?: string;
  status?: "pending" | "completed";
  subtasks?: Array<{ id: string; title: string; completed: boolean }>;
  attachments?: Array<{ id: string; name: string; url: string }>;
  order?: number;
};

function serializeActivity(activity: any) {
  const metadata = (activity.metadata || {}) as TaskMetadata;
  return {
    ...activity,
    offerId: activity.offerId ?? null,
    tag: metadata.tag ?? null,
    status: metadata.status ?? null,
    subtasks: metadata.subtasks ?? null,
    attachments: metadata.attachments ?? null,
    order: metadata.order ?? null,
  };
}

function readContext(input: Record<string, unknown>): AcademicContextInput {
  return { offerId: input.offerId as string | number | null | undefined, classId: input.classId as string | number | null | undefined };
}

async function getSession(): Promise<AdminAuthSession | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "professor" && session.user.role !== "admin" && session.user.role !== "super_admin")) return null;
  return session as AdminAuthSession;
}

async function authorizeContext(session: NonNullable<Awaited<ReturnType<typeof getSession>>>, input: AcademicContextInput) {
  const offerId = normalizeAcademicId(input.offerId);
  const classId = normalizeAcademicId(input.classId);
  if (!offerId && !classId) return { context: null, allowed: false as const, missing: true };

  if (offerId && classId) {
    const [offerContext, classContext] = await Promise.all([
      resolveAcademicContext({ offerId }),
      resolveAcademicContext({ classId }),
    ]);
    if (!offerContext || !classContext || offerContext.offerId !== classContext.offerId || offerContext.courseId !== classContext.courseId) {
      return { context: null, allowed: false as const, conflict: true };
    }
  }

  const result = await resolveAndAuthorizeAcademicContext(session, { offerId, classId }, "manage");
  return result.allowed ? { context: result.context, allowed: true as const } : { context: null, allowed: false as const };
}

function badContextResponse(result: Awaited<ReturnType<typeof authorizeContext>>) {
  if ("conflict" in result && result.conflict) return NextResponse.json({ error: "offerId e classId não pertencem ao mesmo contexto acadêmico." }, { status: 409 });
  return NextResponse.json({ error: "Oferta/turma não encontrada ou sem autorização para este professor." }, { status: 403 });
}

async function authorizeCourseFallback(session: NonNullable<Awaited<ReturnType<typeof getSession>>>, courseId: number) {
  return session.user.role === "admin" || session.user.role === "super_admin" || await canManageCourse(session, courseId);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    const params = new URL(request.url).searchParams;
    const input = { offerId: params.get("offerId"), classId: params.get("classId") };
    const hasContext = Boolean(normalizeAcademicId(input.offerId) || normalizeAcademicId(input.classId));

    if (hasContext) {
      const access = await authorizeContext(session, input);
      if (!access.allowed) return badContextResponse(access);
      if (!access.context?.courseId) return NextResponse.json({ error: "O contexto não possui curso compatível com tarefas." }, { status: 409 });
      const scoped = await db.query.activities.findMany({
        where: and(eq(activities.courseId, access.context.courseId), or(eq(activities.offerId, access.context.offerId!), isNull(activities.offerId))),
        with: { course: true },
        orderBy: [desc(activities.createdAt)],
      });
      return NextResponse.json({ activities: scoped.map(serializeActivity), context: { offerId: access.context.offerId, classId: access.context.classId, courseId: access.context.courseId } });
    }

    if (session.user.role === "admin" || session.user.role === "super_admin") {
      const allActivities = await db.query.activities.findMany({ with: { course: true }, orderBy: [desc(activities.createdAt)] });
      return NextResponse.json({ activities: allActivities.map(serializeActivity), context: null });
    }

    const teacher = session.user.email ? await db.query.users.findFirst({ where: eq(users.email, session.user.email) }) : null;
    if (!teacher) return NextResponse.json({ error: "Professor não encontrado." }, { status: 403 });
    const teacherCourses = await db.query.courses.findMany({ columns: { id: true, instructor: true } });
    const allowedCourseIds = teacherCourses.filter((course) => {
      const instructor = course.instructor?.toLowerCase();
      return instructor === teacher.name?.toLowerCase() || instructor === teacher.email?.toLowerCase() || instructor === "anderson palafoz";
    }).map((course) => course.id);
    if (allowedCourseIds.length === 0) return NextResponse.json({ activities: [], context: null });
    const scoped = await db.query.activities.findMany({ where: inArray(activities.courseId, allowedCourseIds), with: { course: true }, orderBy: [desc(activities.createdAt)] });
    return NextResponse.json({ activities: scoped.map(serializeActivity), context: null });
  } catch (error) {
    console.error("Erro ao carregar tarefas:", error);
    return NextResponse.json({ error: "Não foi possível carregar as tarefas." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    const body = await request.json();
    const title = String(body.title || "").trim();
    const type = String(body.type || "").trim();
    const suppliedCourseId = normalizeAcademicId(body.courseId);
    if (!title || !type) return NextResponse.json({ error: "Título e tipo de atividade são obrigatórios." }, { status: 400 });

    const input = readContext(body);
    const hasContext = Boolean(normalizeAcademicId(input.offerId) || normalizeAcademicId(input.classId));
    let context = null;
    if (hasContext) {
      const access = await authorizeContext(session, input);
      if (!access.allowed) return badContextResponse(access);
      context = access.context;
    }
    const courseId = context?.courseId ?? suppliedCourseId;
    if (!courseId) return NextResponse.json({ error: "Selecione uma oferta/turma ou informe um curso válido." }, { status: 400 });
    if (context?.courseId && suppliedCourseId && context.courseId !== suppliedCourseId) return NextResponse.json({ error: "O curso não corresponde ao contexto acadêmico." }, { status: 409 });
    if (!context && !(await authorizeCourseFallback(session, courseId))) return NextResponse.json({ error: "Você não tem acesso a este curso." }, { status: 403 });

    const metadata: TaskMetadata = {
      ...(typeof body.tag === "string" && body.tag.trim() ? { tag: body.tag.trim() } : {}),
      status: "pending",
      ...(Array.isArray(body.subtasks) ? { subtasks: body.subtasks } : {}),
      ...(Array.isArray(body.attachments) ? { attachments: body.attachments } : {}),
      ...(Number.isFinite(Number(body.order)) ? { order: Number(body.order) } : {}),
    };
    const [newActivity] = await db.insert(activities).values({ title, description: body.description ? String(body.description).trim() : null, courseId, offerId: context?.offerId ?? null, type: type as any, dueDate: body.dueDate ? new Date(body.dueDate) : null, metadata }).returning();
    return NextResponse.json({ success: true, activity: serializeActivity(newActivity), context: context ? { offerId: context.offerId, classId: context.classId, courseId: context.courseId } : null }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    return NextResponse.json({ error: "Erro interno ao criar tarefa." }, { status: 500 });
  }
}

async function authorizeExistingActivity(session: NonNullable<Awaited<ReturnType<typeof getSession>>>, existing: any, input: AcademicContextInput) {
  const requestedOfferId = normalizeAcademicId(input.offerId);
  const requestedClassId = normalizeAcademicId(input.classId);
  if (requestedOfferId || requestedClassId) {
    const access = await authorizeContext(session, input);
    if (!access.allowed) return { response: badContextResponse(access), context: null };
    if (!access.context?.courseId || access.context.courseId !== existing.courseId || (existing.offerId && access.context.offerId !== existing.offerId)) {
      return { response: NextResponse.json({ error: "A tarefa não pertence ao contexto acadêmico informado." }, { status: 403 }), context: null };
    }
    return { response: null, context: access.context };
  }
  if (existing.offerId) {
    const access = await authorizeContext(session, { offerId: existing.offerId });
    if (!access.allowed) return { response: badContextResponse(access), context: null };
    return { response: null, context: access.context };
  }
  if (!(await authorizeCourseFallback(session, existing.courseId))) return { response: NextResponse.json({ error: "Você não tem acesso a esta tarefa." }, { status: 403 }), context: null };
  return { response: null, context: null };
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    const body = await request.json();
    const activityId = normalizeAcademicId(body.id);
    if (!activityId) return NextResponse.json({ error: "ID da atividade é obrigatório." }, { status: 400 });
    const existing = await db.query.activities.findFirst({ where: eq(activities.id, activityId) });
    if (!existing) return NextResponse.json({ error: "Atividade não encontrada." }, { status: 404 });
    const access = await authorizeExistingActivity(session, existing, readContext(body));
    if (access.response) return access.response;
    const current = (existing.metadata || {}) as TaskMetadata;
    const nextMetadata: TaskMetadata = { ...current, ...(body.tag !== undefined ? { tag: String(body.tag).trim() || undefined } : {}), ...(body.status !== undefined ? { status: body.status === "completed" ? "completed" : "pending" } : {}), ...(body.subtasks !== undefined ? { subtasks: body.subtasks } : {}), ...(body.attachments !== undefined ? { attachments: body.attachments } : {}), ...(body.order !== undefined ? { order: Number(body.order) } : {}) };
    const [updated] = await db.update(activities).set({ title: body.title !== undefined ? String(body.title).trim() : undefined, description: body.description !== undefined ? body.description : undefined, dueDate: body.dueDate === null || body.dueDate === "" ? null : body.dueDate !== undefined ? new Date(body.dueDate) : undefined, type: body.type || undefined, metadata: nextMetadata }).where(eq(activities.id, activityId)).returning();
    return NextResponse.json({ success: true, activity: serializeActivity(updated), context: access.context ? { offerId: access.context.offerId, classId: access.context.classId, courseId: access.context.courseId } : null });
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    return NextResponse.json({ error: "Não foi possível atualizar a tarefa." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    const params = new URL(request.url).searchParams;
    const activityId = normalizeAcademicId(params.get("id"));
    if (!activityId) return NextResponse.json({ error: "ID da atividade é obrigatório." }, { status: 400 });
    const existing = await db.query.activities.findFirst({ where: eq(activities.id, activityId) });
    if (!existing) return NextResponse.json({ error: "Atividade não encontrada." }, { status: 404 });
    const access = await authorizeExistingActivity(session, existing, { offerId: params.get("offerId"), classId: params.get("classId") });
    if (access.response) return access.response;
    await db.delete(activities).where(eq(activities.id, activityId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error);
    return NextResponse.json({ error: "Não foi possível excluir a tarefa." }, { status: 500 });
  }
}
