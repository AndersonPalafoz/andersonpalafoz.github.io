import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lessons, modules } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "professor" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, moduleTitle, title, description, videoUrl, duration, content, order } = body;

    if (!courseId || !title) {
      return NextResponse.json({ error: "courseId e title são obrigatórios" }, { status: 400 });
    }

    // Verificar se existe módulo para este curso, senão criar módulo padrão
    let targetModule = await db.query.modules.findFirst({
      where: eq(modules.courseId, Number(courseId)),
    });

    if (!targetModule) {
      const createdModules = await db
        .insert(modules)
        .values({
          courseId: Number(courseId),
          title: moduleTitle || "Módulo Principal",
          description: "Módulo gerado automaticamente para aulas",
          order: 1,
        })
        .returning();
      targetModule = createdModules[0];
    }

    // Criar aula
    const createdLessons = await db
      .insert(lessons)
      .values({
        moduleId: targetModule.id,
        title,
        description: description || "",
        videoUrl: videoUrl || "",
        duration: duration ? Number(duration) : 15,
        order: order ? Number(order) : 1,
        content: content || "",
      })
      .returning();

    return NextResponse.json({ lesson: createdLessons[0], module: targetModule }, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "professor" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "courseId é obrigatório" }, { status: 400 });
    }

    const courseModules = await db.query.modules.findMany({
      where: eq(modules.courseId, Number(courseId)),
    });

    const moduleIds = courseModules.map((m) => m.id);
    if (moduleIds.length === 0) {
      return NextResponse.json({ lessons: [] });
    }

    const allLessons = [];
    for (const mod of courseModules) {
      const modLessons = await db.query.lessons.findMany({
        where: eq(lessons.moduleId, mod.id),
      });
      allLessons.push(...modLessons.map(l => ({ ...l, moduleTitle: mod.title })));
    }

    return NextResponse.json({ lessons: allLessons, modules: courseModules });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
  }
}
