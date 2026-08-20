import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db, getLessonById, getModuleById, getCourseById } from "@/lib/db";
import { activities, coursePurchases as schemaCoursePurchases, enrollments as schemaEnrollments, materials, lessonProgress, userActivityProgress, users } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const lessonId = Number((await params).id);
    if (!Number.isInteger(lessonId) || lessonId <= 0) return NextResponse.json({ error: "ID de aula inválido." }, { status: 400 });

    // O conteúdo da aula pode ser pré-visualizado sem login. Progresso e dados pessoais
    // continuam condicionados à conta autenticada logo abaixo.
    const user = session?.user?.email
      ? await db.query.users.findFirst({ where: eq(users.email, session.user.email) })
      : null;

    const lesson = await getLessonById(lessonId);
    if (!lesson) return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 });

    const module = await getModuleById(lesson.moduleId);
    const course = module ? await getCourseById(module.courseId) : null;

    const isExternalCourse = course?.courseType === 4;
    const isPrivilegedUser = session?.user?.role === "admin" || session?.user?.role === "professor" || session?.user?.email === "palafozanderson@gmail.com";
    let hasExternalCourseAccess = !isExternalCourse || isPrivilegedUser;

    if (isExternalCourse && !hasExternalCourseAccess && user) {
      const [enrollment, purchase] = await Promise.all([
        db.query.enrollments.findFirst({
          where: and(eq(schemaEnrollments.userId, user.id), eq(schemaEnrollments.courseId, course.id)),
        }),
        db.query.coursePurchases.findFirst({
          where: and(eq(schemaCoursePurchases.userId, user.id), eq(schemaCoursePurchases.courseId, course.id)),
        }),
      ]);
      hasExternalCourseAccess = Boolean(enrollment || purchase);
    }

    if (isExternalCourse && !hasExternalCourseAccess) {
      return NextResponse.json({ error: "Este curso externo exige autorização." }, { status: 403 });
    }

    const lessonMaterials = await db.query.materials.findMany({
      where: eq(materials.lessonId, lessonId),
    });

    const lessonActivities = await db.query.activities.findMany({
      where: eq(activities.courseId, module?.courseId || 0),
    });

    const progressRecord = user
      ? await db.query.lessonProgress.findFirst({
          where: and(eq(lessonProgress.userId, user.id), eq(lessonProgress.lessonId, lessonId)),
        })
      : null;

    const activityProgress = user
      ? await db.query.userActivityProgress.findMany({
          where: eq(userActivityProgress.userId, user.id),
        })
      : [];

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
