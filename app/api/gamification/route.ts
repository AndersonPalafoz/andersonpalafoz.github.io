import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { userGamificationPoints, users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    let pointsRecord = await db.query.userGamificationPoints.findFirst({
      where: eq(userGamificationPoints.userId, user.id),
    });

    if (!pointsRecord) {
      // Inicializar registro real para o usuário com 1 dia de streak e XP inicial base
      const [newRecord] = await db.insert(userGamificationPoints).values({
        userId: user.id,
        points: 350,
        level: "Intermediário (B1)",
        streakDays: 1, // Começa em 1 dia real em vez de travado em 14
      }).returning();
      pointsRecord = newRecord;
    }

    return NextResponse.json({
      success: true,
      points: pointsRecord.points,
      level: pointsRecord.level,
      streakDays: pointsRecord.streakDays,
    });
  } catch (error) {
    console.error("Error fetching gamification points:", error);
    return NextResponse.json({ error: "Falha ao carregar dados de gamificação" }, { status: 500 });
  }
}
