import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { courses, modules } from "@/drizzle/schema";
import { isCompleteOrder } from "@/lib/academic-hierarchy";

type RouteContext = { params: Promise<{ id: string }> };

function canManage(role?: string | null) {
  return role === "professor" || role === "admin";
}

async function getCourseId(context: RouteContext) {
  const { id } = await context.params;
  const courseId = Number(id);
  return Number.isInteger(courseId) && courseId > 0 ? courseId : null;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !canManage(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseId = await getCourseId(context);
    if (!courseId) return NextResponse.json({ error: "ID do curso inválido" }, { status: 400 });

    const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
    if (!course) return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 });

    const courseModules = await db.query.modules.findMany({
      where: eq(modules.courseId, courseId),
      orderBy: asc(modules.order),
    });
    return NextResponse.json({ course, modules: courseModules });
  } catch (error) {
    console.error("Error fetching course modules:", error);
    return NextResponse.json({ error: "Não foi possível carregar os módulos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !canManage(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseId = await getCourseId(context);
    if (!courseId) return NextResponse.json({ error: "ID do curso inválido" }, { status: 400 });
    const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
    if (!course) return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 });

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) return NextResponse.json({ error: "O título do módulo é obrigatório" }, { status: 400 });

    const existingModules = await db.query.modules.findMany({
      where: eq(modules.courseId, courseId),
      orderBy: asc(modules.order),
    });
    const requestedOrder = Number(body.order);
    const nextOrder = Number.isInteger(requestedOrder) && requestedOrder > 0
      ? requestedOrder
      : existingModules.length + 1;

    const [created] = await db.insert(modules).values({
      courseId,
      title,
      description: typeof body.description === "string" ? body.description.trim() : null,
      order: nextOrder,
    }).returning();

    if (!created) return NextResponse.json({ error: "Módulo não criado" }, { status: 500 });
    return NextResponse.json({ module: created }, { status: 201 });
  } catch (error) {
    console.error("Error creating course module:", error);
    return NextResponse.json({ error: "Não foi possível criar o módulo" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !canManage(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseId = await getCourseId(context);
    if (!courseId) return NextResponse.json({ error: "ID do curso inválido" }, { status: 400 });
    const body = await request.json();
    const moduleIds = Array.isArray(body.moduleIds) ? body.moduleIds.map(Number) : [];
    if (moduleIds.length === 0 || moduleIds.some((id: number) => !Number.isInteger(id) || id <= 0)) {
      return NextResponse.json({ error: "moduleIds deve conter IDs válidos" }, { status: 400 });
    }

    const existingModules = await db.query.modules.findMany({
      where: eq(modules.courseId, courseId),
      columns: { id: true },
    });
    const existingIds = existingModules.map((module) => module.id);
    if (!isCompleteOrder(moduleIds, existingIds)) {
      return NextResponse.json({ error: "A ordem enviada não corresponde aos módulos do curso" }, { status: 400 });
    }

    for (const [index, moduleId] of moduleIds.entries()) {
      await db.update(modules)
        .set({ order: index + 1, updatedAt: new Date() })
        .where(and(eq(modules.id, moduleId), eq(modules.courseId, courseId)));
    }

    const updatedModules = await db.query.modules.findMany({
      where: eq(modules.courseId, courseId),
      orderBy: asc(modules.order),
    });
    return NextResponse.json({ modules: updatedModules });
  } catch (error) {
    console.error("Error reordering course modules:", error);
    return NextResponse.json({ error: "Não foi possível salvar a ordem dos módulos" }, { status: 500 });
  }
}
