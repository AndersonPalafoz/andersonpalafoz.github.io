import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db, getLessonById, getModuleById, getCourseById } from "@/lib/db";
import { activities, materials, lessonProgress, userActivityProgress, users } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    const lessonId = Number((await params).id);
    if (!Number.isInteger(lessonId) || lessonId <= 0) return NextResponse.json({ error: "ID de aula inválido." }, { status: 400 });

    const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

    const lesson = await getLessonById(lessonId);
    if (!lesson) return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 });

    const module = await getModuleById(lesson.moduleId);
    const course = module ? await getCourseById(module.courseId) : null;

    const lessonMaterials = await db.query.materials.findMany({
      where: eq(materials.lessonId, lessonId),
    });

    const lessonActivities = await db.query.activities.findMany({
      where: eq(activities.courseId, module?.courseId || 0),
    });

    const progressRecord = await db.query.lessonProgress.findFirst({
      where: and(eq(lessonProgress.userId, user.id), eq(lessonProgress.lessonId, lessonId)),
    });

    const activityProgress = await db.query.userActivityProgress.findMany({
      where: eq(userActivityProgress.userId, user.id),
    });

    return NextResponse.json({
      lesson,
      module,
      course,
      materials: lessonMaterials,
      activities: lessonActivities,
      completed: progressRecord?.completed === 1,
      activityProgress,
    });
  } catch (error) {
    console.error("Error loading lesson detail:", error);
    return NextResponse.json({ error: "Não foi possível carregar os dados da aula." }, { status: 500 });
  }
}
