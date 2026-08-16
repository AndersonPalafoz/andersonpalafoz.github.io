import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { attendances, classSessions, userActivityProgress, users } from "@/drizzle/schema";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const activitiesProgress = await db.select({
      id: userActivityProgress.id,
      score: userActivityProgress.score,
      status: userActivityProgress.status,
      teacherFeedback: userActivityProgress.teacherFeedback,
      submittedAt: userActivityProgress.submittedAt,
    }).from(userActivityProgress).where(eq(userActivityProgress.userId, dbUser.id));

    const studentAttendances = await db.select({
      id: attendances.id,
      present: attendances.present,
      status: attendances.status,
      notes: attendances.notes,
      recordedAt: attendances.recordedAt,
      sessionTitle: classSessions.title,
      scheduledAt: classSessions.scheduledAt,
      modality: classSessions.modality,
    }).from(attendances)
      .innerJoin(classSessions, eq(attendances.sessionId, classSessions.id))
      .where(eq(attendances.studentId, dbUser.id));

    return NextResponse.json({
      activities: activitiesProgress,
      attendances: studentAttendances,
    });
  } catch (error) {
    console.error("Erro ao carregar histórico acadêmico:", error);
    return NextResponse.json({ error: "Não foi possível carregar o histórico." }, { status: 500 });
  }
}
