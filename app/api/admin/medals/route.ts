import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { medalsCatalog, userMedals, userNotifications, users } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const catalog = await db.select().from(medalsCatalog).orderBy(medalsCatalog.title);
    const grantedList = await db
      .select({
        id: userMedals.id,
        userId: userMedals.userId,
        userName: users.name,
        userEmail: users.email,
        medalCode: userMedals.medalCode,
        grantType: userMedals.grantType,
        notes: userMedals.notes,
        createdAt: userMedals.createdAt,
      })
      .from(userMedals)
      .leftJoin(users, eq(userMedals.userId, users.id))
      .orderBy(desc(userMedals.createdAt))
      .limit(100);

    const allUsers = await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.role, "user"));

    return NextResponse.json({ catalog, grantedList, allUsers });
  } catch (error) {
    console.error("Error fetching medals admin data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminId = parseInt(session.user.id || "1");
    const body = await request.json();
    const { userId, medalCode, notes } = body;

    if (!userId || !medalCode) {
      return NextResponse.json({ error: "Missing required fields: userId and medalCode" }, { status: 400 });
    }

    // Inserir medalha
    await db.insert(userMedals).values({
      userId: Number(userId),
      medalCode,
      awardedBy: adminId,
      grantType: "manual",
      notes: notes || "Concedido manualmente pelo painel administrativo.",
    });

    // Buscar detalhes da medalha para notificação bonita
    const [medalMeta] = await db.select().from(medalsCatalog).where(eq(medalsCatalog.code, medalCode));
    const medalTitle = medalMeta ? `${medalMeta.icon} ${medalMeta.title}` : "Nova Medalha Conquistada";

    // Criar notificação persistente para o aluno
    await db.insert(userNotifications).values({
      userId: Number(userId),
      title: `🏆 Conquista Desbloqueada: ${medalTitle}`,
      message: notes ? `Você recebeu uma nova medalha! Justificativa: "${notes}"` : "Você recebeu uma nova medalha por seu desempenho na plataforma!",
      type: "achievement",
      isRead: false,
    });

    return NextResponse.json({ success: true, message: "Medalha concedida e notificação enviada ao aluno com sucesso!" });
  } catch (error) {
    console.error("Error granting medal manually:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
