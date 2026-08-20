import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { lessons, materials, modules } from "@/drizzle/schema";
import { and, asc, eq, inArray } from "drizzle-orm";

function canManage(role?: string | null) {
  return role === "admin";
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !canManage(session.user.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { courseId, moduleId, moduleTitle, title, description, videoUrl, audioUrl, duration, content, order, materialUrl, materialTitle, materialCategory, materialLevel } = body;
    const parsedCourseId = Number(courseId);
    if (!Number.isInteger(parsedCourseId) || parsedCourseId <= 0 || !title?.trim()) return NextResponse.json({ error: "courseId e title são obrigatórios" }, { status: 400 });

    const normalizedAudioUrl = typeof audioUrl === "string" ? audioUrl.trim() : "";
    if (normalizedAudioUrl) {
      try {
        const parsedAudioUrl = new URL(normalizedAudioUrl);
        if (!['http:', 'https:'].includes(parsedAudioUrl.protocol)) throw new Error();
      } catch {
        return NextResponse.json({ error: "A URL do áudio deve começar com http:// ou https://." }, { status: 400 });
      }
    }

    let targetModule = moduleId ? await db.query.modules.findFirst({ where: and(eq(modules.id, Number(moduleId)), eq(modules.courseId, parsedCourseId)) }) : null;
    if (!targetModule && moduleTitle?.trim()) {
      targetModule = await db.query.modules.findFirst({ where: and(eq(modules.courseId, parsedCourseId), eq(modules.title, moduleTitle.trim())) });
    }
    if (!targetModule) {
      const existingModules = await db.query.modules.findMany({ where: eq(modules.courseId, parsedCourseId) });
      const createdModules = await db.insert(modules).values({
        courseId: parsedCourseId,
        title: moduleTitle?.trim() || `Módulo ${existingModules.length + 1}`,
        description: "Módulo criado a partir do construtor de aulas",
        order: existingModules.length + 1,
      }).returning();
      targetModule = createdModules[0];
    }

    const existingLessons = await db.query.lessons.findMany({ where: eq(lessons.moduleId, targetModule.id) });
    const createdLessons = await db.insert(lessons).values({
      moduleId: targetModule.id,
      title: title.trim(),
      description: description?.trim() || "",
      videoUrl: videoUrl?.trim() || "",
      audioUrl: normalizedAudioUrl || "",
      duration: Number.isFinite(Number(duration)) ? Number(duration) : 15,
      order: Number.isFinite(Number(order)) && Number(order) > 0 ? Number(order) : existingLessons.length + 1,
      content: content || "",
    }).returning();

    let material = null;
    if (typeof materialUrl === "string" && materialUrl.trim()) {
      material = (await db.insert(materials).values({
        title: materialTitle?.trim() || `Material de apoio — ${title.trim()}`,
        description: `Material complementar da aula ${title.trim()}`,
        category: materialCategory?.trim() || "Material de apoio",
        level: materialLevel?.trim() || "A1",
        fileUrl: materialUrl.trim(),
        lessonId: createdLessons[0].id,
        courseId: parsedCourseId,
        isPublic: false,
      }).returning())[0];
    }

    return NextResponse.json({ lesson: createdLessons[0], module: targetModule, material }, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !canManage(session.user.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json() as { courseId?: number; lessonIds?: number[] };
    const courseId = Number(body.courseId);
    const lessonIds = Array.isArray(body.lessonIds) ? body.lessonIds.map(Number) : [];
    if (!Number.isInteger(courseId) || courseId <= 0 || lessonIds.length === 0 || lessonIds.some((id) => !Number.isInteger(id) || id <= 0) || new Set(lessonIds).size !== lessonIds.length) {
      return NextResponse.json({ error: "courseId e lessonIds válidos são obrigatórios." }, { status: 400 });
    }

    const courseModules = await db.query.modules.findMany({ where: eq(modules.courseId, courseId) });
    const moduleIds = courseModules.map((module) => module.id);
    if (!moduleIds.length) return NextResponse.json({ error: "Curso sem módulos persistidos." }, { status: 404 });

    const existingLessons = await db.query.lessons.findMany({ where: and(inArray(lessons.id, lessonIds), inArray(lessons.moduleId, moduleIds)) });
    if (existingLessons.length !== lessonIds.length) return NextResponse.json({ error: "A lista contém aulas que não pertencem ao curso informado." }, { status: 400 });

    const lessonsById = new Map(existingLessons.map((lesson) => [lesson.id, lesson]));
    const nextOrderByModule = new Map<number, number>();
    await db.transaction(async (transaction) => {
      for (const lessonId of lessonIds) {
        const lesson = lessonsById.get(lessonId);
        if (!lesson) continue;
        const nextOrder = (nextOrderByModule.get(lesson.moduleId) || 0) + 1;
        nextOrderByModule.set(lesson.moduleId, nextOrder);
        await transaction.update(lessons).set({ order: nextOrder, updatedAt: new Date() }).where(eq(lessons.id, lessonId));
      }
    });

    return NextResponse.json({ message: "Ordem das aulas salva no banco de dados." });
  } catch (error) {
    console.error("Error reordering lessons:", error);
    return NextResponse.json({ error: "Não foi possível salvar a ordem das aulas." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !canManage(session.user.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const courseId = Number(new URL(request.url).searchParams.get("courseId"));
    if (!Number.isInteger(courseId) || courseId <= 0) return NextResponse.json({ error: "courseId é obrigatório" }, { status: 400 });

    const courseModules = await db.query.modules.findMany({ where: eq(modules.courseId, courseId), orderBy: asc(modules.order) });
    const allLessons = [];
    for (const mod of courseModules) {
      const modLessons = await db.query.lessons.findMany({ where: eq(lessons.moduleId, mod.id), orderBy: asc(lessons.order) });
      for (const lesson of modLessons) {
        const linkedMaterials = await db.select().from(materials).where(eq(materials.lessonId, lesson.id));
        allLessons.push({ ...lesson, moduleId: mod.id, moduleTitle: mod.title, materials: linkedMaterials, materialUrl: linkedMaterials[0]?.fileUrl || null });
      }
    }
    return NextResponse.json({ lessons: allLessons, modules: courseModules });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
  }
}
