import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db, getModulesByCourse, getLessonsByModule, getCourseById } from "@/lib/db";
import { lessonProgress, users } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseIdParam = searchParams.get("courseId");
    if (!courseIdParam) {
      return NextResponse.json({ error: "courseId é obrigatório" }, { status: 400 });
    }

    const courseId = parseInt(courseIdParam);
    const userId = Number((session.user as any).id);

    const course = await getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 });
    }

    const modules = await getModulesByCourse(courseId);
    let totalLessons = 0;
    const lessonIds: number[] = [];
    for (const mod of modules) {
      const lessons = await getLessonsByModule(mod.id);
      totalLessons += lessons.length;
      lessons.forEach(l => lessonIds.push(l.id));
    }

    let completedCount = 0;
    for (const lid of lessonIds) {
      const lp = await db.query.lessonProgress.findFirst({
        where: and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lid)),
      });
      if (lp && lp.completed === 1) {
        completedCount++;
      }
    }

    const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const isEligible = percentage >= 100;

    const studentUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    return NextResponse.json({
      eligible: isEligible,
      percentage,
      studentName: studentUser?.name || session.user.name || "Aluno(a)",
      courseName: course.title,
      instructor: course.instructor || "Anderson Palafoz",
      issueDate: new Date().toLocaleDateString("pt-BR"),
      certificateCode: `AP-CERT-${courseId}-${userId}-${Date.now().toString().slice(-6)}`,
    });
  } catch (error) {
    console.error("Error generating certificate data:", error);
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 });
  }
}
