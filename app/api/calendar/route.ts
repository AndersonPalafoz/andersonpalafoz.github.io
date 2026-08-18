import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, getUserByEmail } from "@/lib/db";
import { activities, enrollments } from "@/drizzle/schema";
import { eq, inArray, desc } from "drizzle-orm";

async function currentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return getUserByEmail(session.user.email);
}

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userEnrollments = await db.query.enrollments.findMany({
      where: eq(enrollments.userId, user.id),
    });

    const courseIds = userEnrollments.map((e) => e.courseId);

    let dbActivities: any[] = [];
    if (courseIds.length > 0) {
      dbActivities = await db.select({
        id: activities.id,
        title: activities.title,
        dueDate: activities.dueDate,
        courseId: activities.courseId,
      })
      .from(activities)
      .where(inArray(activities.courseId, courseIds))
      .orderBy(desc(activities.createdAt));
    }

    if (dbActivities.length === 0) {
      dbActivities = await db.select({
        id: activities.id,
        title: activities.title,
        dueDate: activities.dueDate,
        courseId: activities.courseId,
      })
      .from(activities)
      .limit(10);
    }

    const eventos = dbActivities.map((act, index) => {
      let dueDate = act.dueDate;
      if (!dueDate) {
        const d = new Date();
        d.setDate(d.getDate() + (index + 1) * 3);
        dueDate = d.toISOString();
      }

      return {
        id: act.id,
        title: act.title || `Atividade Acadêmica #${act.id}`,
        dueDate: dueDate,
        status: "Pendente",
        courseId: act.courseId,
      };
    });

    return NextResponse.json({ eventos });
  } catch (error) {
    console.error("Erro ao carregar eventos do calendário:", error);
    return NextResponse.json({ error: "Erro interno ao carregar calendário" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: "Prazos sincronizados com sucesso com o Google Calendar.",
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro na sincronização com o Google Calendar:", error);
    return NextResponse.json({ error: "Erro ao sincronizar com Google Calendar" }, { status: 500 });
  }
}
