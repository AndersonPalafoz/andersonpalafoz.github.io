import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, userActivityProgress, activities } from "@/drizzle/schema";
import { and, eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["professor", "admin", "super_admin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Acesso restrito a professores e administradores." }, { status: 403 });
    }

    const activityIdParam = request.nextUrl.searchParams.get("activityId");
    const activityId = activityIdParam ? Number(activityIdParam) : null;

    // Buscar submissões de áudio (speaking) dos alunos
    const submissions = await db.query.userActivityProgress.findMany({
      where: activityId ? and(eq(userActivityProgress.activityId, activityId)) : undefined,
      with: {
        user: true,
        activity: true,
      },
      orderBy: desc(userActivityProgress.submittedAt),
      limit: 50,
    });

    // Filtrar apenas os que possuem áudio de speaking gravado
    const speakingSubmissions = submissions
      .filter((s) => s.audioResponseUrl && s.audioResponseUrl.trim().length > 0)
      .map((s) => ({
        id: s.id,
        userId: s.userId,
        studentName: s.user?.name || s.user?.email || "Aluno",
        studentEmail: s.user?.email || "",
        activityId: s.activityId,
        activityTitle: s.activity?.title || "Prática de Speaking",
        audioUrl: s.audioResponseUrl,
        transcript: "",
        feedback: s.teacherFeedback || "",
        score: s.score || 0,
        status: s.status,
        updatedAt: s.submittedAt,
      }));

    return NextResponse.json({ submissions: speakingSubmissions });
  } catch (error) {
    console.error("Error fetching speaking submissions:", error);
    return NextResponse.json({ error: "Erro ao carregar gravações de speaking." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Faça login para enviar sua gravação." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.activityId || !body.audioUrl) {
      return NextResponse.json({ error: "Atividade e URL do áudio são obrigatórias." }, { status: 400 });
    }

    const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 401 });

    const activityId = Number(body.activityId);
    const audioUrl = String(body.audioUrl);
    const submissionText = body.transcript ? String(body.transcript) : "";

    // Verificar se já existe progresso para esta atividade
    const existing = await db.query.userActivityProgress.findFirst({
      where: and(eq(userActivityProgress.userId, user.id), eq(userActivityProgress.activityId, activityId)),
    });

    if (existing) {
      const [updated] = await db.update(userActivityProgress)
        .set({
          audioResponseUrl: audioUrl,
          status: "in_progress",
          submittedAt: new Date(),
        })
        .where(eq(userActivityProgress.id, existing.id))
        .returning();
      return NextResponse.json({ success: true, progress: updated });
    } else {
      const [inserted] = await db.insert(userActivityProgress).values({
        userId: user.id,
        activityId,
        audioResponseUrl: audioUrl,
        status: "in_progress",
        score: 0,
        submittedAt: new Date(),
      }).returning();
      return NextResponse.json({ success: true, progress: inserted });
    }
  } catch (error) {
    console.error("Error saving speaking submission:", error);
    return NextResponse.json({ error: "Erro ao salvar áudio da atividade." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["professor", "admin", "super_admin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Acesso restrito a professores e administradores." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.progressId) {
      return NextResponse.json({ error: "ID de progresso inválido." }, { status: 400 });
    }

    const progressId = Number(body.progressId);
    const feedback = body.feedback ? String(body.feedback).trim() : "";
    const score = body.score !== undefined ? Number(body.score) : 100;

    const [updated] = await db.update(userActivityProgress)
      .set({
        teacherFeedback: feedback,
        score,
        status: "completed",
      })
      .where(eq(userActivityProgress.id, progressId))
      .returning();

    return NextResponse.json({ success: true, progress: updated });
  } catch (error) {
    console.error("Error grading speaking submission:", error);
    return NextResponse.json({ error: "Erro ao salvar avaliação do professor." }, { status: 500 });
  }
}
