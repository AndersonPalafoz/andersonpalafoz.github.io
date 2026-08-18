import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, getUserByEmail } from "@/lib/db";
import { gradeReviewRequests, externalClassGrades } from "@/drizzle/schema";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const user = await getUserByEmail(session.user.email);
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const body = await request.json();
    const { gradeId, reason } = body;

    if (!gradeId || !reason || typeof reason !== "string" || reason.trim().length === 0) {
      return NextResponse.json({ error: "ID da nota e justificativa são obrigatórios" }, { status: 400 });
    }

    const [grade] = await db
      .select()
      .from(externalClassGrades)
      .where(eq(externalClassGrades.id, parseInt(gradeId)))
      .limit(1);

    if (!grade) {
      return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 });
    }

    await db.insert(gradeReviewRequests).values({
      gradeId: parseInt(gradeId),
      userId: user.id,
      reason: reason.trim(),
      status: "pending",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting grade review request:", error);
    return NextResponse.json({ error: "Falha ao enviar solicitação de revisão" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const user = await getUserByEmail(session.user.email);
    if (!user || (user.role !== "admin" && user.role !== "professor")) {
      return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
    }

    const body = await request.json();
    const { requestId, status, professorResponse } = body;

    if (!requestId || !status) {
      return NextResponse.json({ error: "ID da solicitação e status são obrigatórios" }, { status: 400 });
    }

    await db
      .update(gradeReviewRequests)
      .set({
        status,
        professorResponse: professorResponse || null,
        updatedAt: new Date(),
      })
      .where(eq(gradeReviewRequests.id, parseInt(requestId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating grade review request:", error);
    return NextResponse.json({ error: "Falha ao atualizar solicitação" }, { status: 500 });
  }
}
