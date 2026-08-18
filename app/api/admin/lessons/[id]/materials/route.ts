import { NextRequest, NextResponse } from "next/server";
import { db, getLessonById, getModuleById } from "@/lib/db";
import { materials } from "@/drizzle/schema";
import { requireTeacherOrAdmin, canManageCourse } from "@/lib/admin-auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireTeacherOrAdmin();
    if (!session) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }

    const lessonId = Number((await params).id);
    if (!Number.isInteger(lessonId) || lessonId <= 0) return NextResponse.json({ error: "Aula inválida." }, { status: 400 });

    const lesson = await getLessonById(lessonId);
    if (!lesson) return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 });
    const module = await getModuleById(lesson.moduleId);
    if (!module || !module.courseId) return NextResponse.json({ error: "Módulo ou curso da aula não encontrado." }, { status: 404 });

    const allowed = await canManageCourse(session, module.courseId);
    if (!allowed) {
      return NextResponse.json({ error: "Você não possui permissão para vincular materiais a esta aula." }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, category, level, fileUrl, isPublic } = body;
    if (!title || !category || !level) {
      return NextResponse.json({ error: "Título, categoria e nível são obrigatórios." }, { status: 400 });
    }

    const inserted = await db.insert(materials).values({
      title,
      description: description || null,
      category,
      level,
      fileUrl: fileUrl || null,
      lessonId,
      courseId: module.courseId,
      isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
      downloads: 0,
    }).returning();

    return NextResponse.json({ success: true, material: inserted[0] });
  } catch (error) {
    console.error("Error creating lesson material:", error);
    return NextResponse.json({ error: "Não foi possível vincular o material à aula." }, { status: 500 });
  }
}
