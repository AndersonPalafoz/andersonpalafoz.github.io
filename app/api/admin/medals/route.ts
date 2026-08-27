import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { medalsCatalog, notifications, userMedals, users } from "@/drizzle/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getPilotMedal, PILOT_MEDALS } from "@/lib/medal-pilot-catalog";
import { canAccessAdminPortal } from "@/lib/role-capabilities";

const MEDAL_CATEGORIES = new Set(["achievement", "academic", "manual", "streak"]);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !canAccessAdminPortal({ email: session.user.email, role: session.user.role })) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storedCatalog = await db.select().from(medalsCatalog).orderBy(medalsCatalog.title);
    const storedCodes = new Set(storedCatalog.map((medal) => medal.code));
    const catalog = [
      ...storedCatalog,
      ...PILOT_MEDALS.filter((medal) => !storedCodes.has(medal.code)).map((medal) => ({ ...medal, id: -1, createdAt: new Date(0) })),
    ].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
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
    if (!session?.user || !canAccessAdminPortal({ email: session.user.email, role: session.user.role })) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminId = Number.parseInt(session.user.id || "", 10);
    const body = await request.json().catch(() => ({}));
    if (body.action === "create") {
      const code = typeof body.code === "string" ? body.code.trim().toLowerCase() : "";
      const title = typeof body.title === "string" ? body.title.trim() : "";
      const description = typeof body.description === "string" ? body.description.trim() : "";
      const requirement = typeof body.requirement === "string" ? body.requirement.trim() : "";
      const icon = typeof body.icon === "string" ? body.icon.trim() : "🏅";
      const category = typeof body.category === "string" ? body.category.trim() : "manual";
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(code) || code.length > 64 || !title || title.length > 120 || description.length < 12 || description.length > 500 || requirement.length < 12 || requirement.length > 500 || icon.length > 32 || !MEDAL_CATEGORIES.has(category)) {
        return NextResponse.json({ error: "Informe código, título, descrição e critério claros; selecione uma categoria válida e mantenha os textos entre 12 e 500 caracteres." }, { status: 400 });
      }
      const existing = await db.query.medalsCatalog.findFirst({ where: eq(medalsCatalog.code, code) });
      if (existing || getPilotMedal(code)) return NextResponse.json({ error: "Já existe uma medalha com este código." }, { status: 409 });
      const [created] = await db.insert(medalsCatalog).values({ code, title, description, icon, category, requirement }).returning();
      return NextResponse.json({ success: true, medal: created }, { status: 201 });
    }
    const medalCode = typeof body.medalCode === "string" ? body.medalCode.trim() : "";
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";
    const batchUserIds: number[] = Array.isArray(body.userIds) ? body.userIds.map((value: unknown) => Number(value)).filter((id: number) => Number.isInteger(id) && id > 0) : [];
    if (body.action === "grant-batch") {
      if (!Number.isInteger(adminId) || adminId <= 0 || !batchUserIds.length || !medalCode || notes.length < 8) return NextResponse.json({ error: "Selecione pelo menos um aluno, uma medalha e informe uma justificativa de pelo menos 8 caracteres." }, { status: 400 });
      const medalMeta = (await db.query.medalsCatalog.findFirst({ where: eq(medalsCatalog.code, medalCode) })) ?? getPilotMedal(medalCode);
      if (!medalMeta) return NextResponse.json({ error: "Medalha não encontrada no catálogo." }, { status: 404 });
      let awarded = 0;
      for (const userId of Array.from(new Set<number>(batchUserIds))) {
        const targetUser = await db.query.users.findFirst({ where: and(eq(users.id, userId), eq(users.role, "user"), eq(users.approvalStatus, "approved"), isNull(users.deletedAt)) });
        const existingGrant = await db.query.userMedals.findFirst({ where: and(eq(userMedals.userId, userId), eq(userMedals.medalCode, medalCode)) });
        if (!targetUser || existingGrant) continue;
        await db.insert(userMedals).values({ userId, medalCode, awardedBy: adminId, grantType: "manual", notes });
        await db.insert(notifications).values({ userId, title: `Conquista desbloqueada: ${medalMeta.title}`, message: `Você recebeu uma nova medalha. Justificativa: ${notes}`, type: "achievement", metadata: JSON.stringify({ medalCode, grantType: "manual" }), readAt: null });
        awarded += 1;
      }
      return NextResponse.json({ success: true, awarded, message: `${awarded} medalha(s) concedida(s) com sucesso.` });
    }
    const userId = Number(body.userId);

    if (!Number.isInteger(adminId) || adminId <= 0 || !Number.isInteger(userId) || userId <= 0 || !medalCode || notes.length < 8) {
      return NextResponse.json({ error: "Selecione um aluno, uma medalha e informe uma justificativa de pelo menos 8 caracteres para a concessão manual." }, { status: 400 });
    }

    const [targetUser, existingGrant] = await Promise.all([
      db.query.users.findFirst({ where: and(eq(users.id, userId), eq(users.role, "user"), eq(users.approvalStatus, "approved"), isNull(users.deletedAt)) }),
      db.query.userMedals.findFirst({ where: and(eq(userMedals.userId, userId), eq(userMedals.medalCode, medalCode)) }),
    ]);

    if (!targetUser) return NextResponse.json({ error: "Aluno não encontrado ou não aprovado." }, { status: 404 });
    const medalMeta = (await db.query.medalsCatalog.findFirst({ where: eq(medalsCatalog.code, medalCode) })) ?? getPilotMedal(medalCode);
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
