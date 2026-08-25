import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { medalsCatalog, notifications, userMedals, users } from "@/drizzle/schema";
import { and, desc, eq, isNull } from "drizzle-orm";

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

    const allUsers = await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(isNull(users.deletedAt)).orderBy(users.name);

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

    const adminId = Number.parseInt(session.user.id || "", 10);
    const body = await request.json().catch(() => ({}));
    const userId = Number(body.userId);
    const medalCode = typeof body.medalCode === "string" ? body.medalCode.trim() : "";
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";

    if (!Number.isInteger(adminId) || adminId <= 0 || !Number.isInteger(userId) || userId <= 0 || !medalCode || !notes) {
      return NextResponse.json({ error: "Selecione um aluno, uma medalha e informe uma justificativa para a concessão manual." }, { status: 400 });
    }

    const [targetUser, medalMeta, existingGrant] = await Promise.all([
      db.query.users.findFirst({ where: and(eq(users.id, userId), eq(users.role, "user"), eq(users.approvalStatus, "approved"), isNull(users.deletedAt)) }),
      db.query.medalsCatalog.findFirst({ where: eq(medalsCatalog.code, medalCode) }),
      db.query.userMedals.findFirst({ where: and(eq(userMedals.userId, userId), eq(userMedals.medalCode, medalCode)) }),
    ]);

    if (!targetUser) return NextResponse.json({ error: "Aluno não encontrado ou não aprovado." }, { status: 404 });
    if (!medalMeta) return NextResponse.json({ error: "Medalha não encontrada no catálogo." }, { status: 404 });
    if (existingGrant) return NextResponse.json({ error: "Esta medalha já foi concedida a este aluno." }, { status: 409 });

    await db.insert(userMedals).values({
      userId,
      medalCode,
      awardedBy: adminId,
      grantType: "manual",
      notes: notes || null,
    });

    await db.insert(notifications).values({
      userId,
      title: `Conquista desbloqueada: ${medalMeta.title}`,
      message: `Você recebeu uma nova medalha. Justificativa: ${notes}` ,
      type: "achievement",
      metadata: JSON.stringify({ medalCode, grantType: "manual" }),
      readAt: null,
    });

    return NextResponse.json({ success: true, message: "Medalha concedida e notificação enviada ao aluno com sucesso." });
  } catch (error) {
    console.error("Error granting medal manually:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
