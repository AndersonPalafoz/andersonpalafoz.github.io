import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { issueCertificateIfEligible } from "@/lib/certificate-service";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const courseId = Number(new URL(request.url).searchParams.get("courseId"));
    if (!Number.isInteger(courseId) || courseId <= 0) return NextResponse.json({ error: "courseId é obrigatório" }, { status: 400 });

    const user = session.user.email
      ? await db.query.users.findFirst({ where: eq(users.email, session.user.email) })
      : null;
    const userId = user?.id || Number((session.user as { id?: string }).id);
    if (!Number.isInteger(userId) || userId <= 0) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const result = await issueCertificateIfEligible(userId, courseId);
    return NextResponse.json({
      eligible: result.eligible,
      percentage: result.percentage,
      studentName: result.student?.name || session.user.name || "Aluno(a)",
      courseName: result.course.title,
      instructor: result.course.instructor || "Anderson Palafoz",
      issueDate: result.certificate?.issuedAt?.toLocaleDateString("pt-BR") || null,
      certificateCode: result.certificate?.certificateCode || null,
      certificateUrl: result.certificate?.certificateUrl || null,
      workloadHours: result.course.workloadHours || 40,
      level: result.course.level || "A1",
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json({ error: "Não foi possível emitir o certificado agora." }, { status: 500 });
  }
}
