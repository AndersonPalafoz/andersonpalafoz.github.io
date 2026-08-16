import { NextResponse } from "next/server";
import { getLessonById, getModuleById, updateLessonProgress } from "@/lib/db";
import { issueCertificateIfEligible } from "@/lib/certificate-service";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const lessonId = Number.parseInt(id, 10);
    const body = await request.json();
    const completed = Boolean(body.completed);
    const userId = Number.parseInt(session.user.id ?? "", 10);
    if (!Number.isInteger(lessonId) || lessonId <= 0 || !Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Identificador inválido." }, { status: 400 });
    }

    await updateLessonProgress(userId, lessonId, completed ? 1 : 0);
    let certificate = null;
    if (completed) {
      const lesson = await getLessonById(lessonId);
      const module = lesson ? await getModuleById(lesson.moduleId) : null;
      if (module) {
        const result = await issueCertificateIfEligible(userId, module.courseId);
        certificate = result.certificate;
      }
    }
    return NextResponse.json({ success: true, certificate });
  } catch (error) {
    console.error("Error updating lesson progress:", error);
    return NextResponse.json({ error: "Não foi possível atualizar o progresso da aula." }, { status: 500 });
  }
}
