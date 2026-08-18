import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminAuditLogs, manualAccessGrants, users, courses, materials, enrollments } from "@/drizzle/schema";

const SUPER_ADMIN_EMAIL = "palafozanderson@gmail.com";

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email || email !== SUPER_ADMIN_EMAIL) return null;
  return db.query.users.findFirst({ where: eq(users.email, email) });
}

export async function GET() {
  try {
    const admin = await requireSuperAdmin();
    if (!admin) return NextResponse.json({ error: "Acesso restrito ao super administrador." }, { status: 403 });

    const [grants, allUsers, allCourses, allMaterials] = await Promise.all([
      db.select({
        id: manualAccessGrants.id,
        userId: manualAccessGrants.userId,
        userName: users.name,
        userEmail: users.email,
        courseId: manualAccessGrants.courseId,
        materialId: manualAccessGrants.materialId,
        reason: manualAccessGrants.reason,
        createdAt: manualAccessGrants.createdAt,
      })
      .from(manualAccessGrants)
      .innerJoin(users, eq(manualAccessGrants.userId, users.id))
      .orderBy(desc(manualAccessGrants.createdAt))
      .limit(100),
      db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(isNull(users.deletedAt)).limit(300),
      db.select({ id: courses.id, title: courses.title, price: courses.price, isFree: courses.isFree }).from(courses).where(isNull(courses.deletedAt)),
      db.select({ id: materials.id, title: materials.title, isPublic: materials.isPublic }).from(materials).limit(300),
    ]);

    return NextResponse.json({ grants, users: allUsers, courses: allCourses, materials: allMaterials });
  } catch (error) {
    console.error("Erro ao carregar concessões manuais de acesso:", error);
    return NextResponse.json({ error: "Não foi possível carregar as concessões de acesso." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireSuperAdmin();
    if (!admin) return NextResponse.json({ error: "Acesso restrito ao super administrador." }, { status: 403 });

    const body = await request.json();
    const userId = Number(body.userId);
    const courseId = body.courseId ? Number(body.courseId) : null;
    const materialId = body.materialId ? Number(body.materialId) : null;
    const reason = String(body.reason || "").trim();

    if (!Number.isInteger(userId) || userId < 1) return NextResponse.json({ error: "Selecione um usuário válido." }, { status: 400 });
    if (!courseId && !materialId) return NextResponse.json({ error: "Selecione um curso ou um material para liberar." }, { status: 400 });
    if (courseId && materialId) return NextResponse.json({ error: "Selecione apenas um item por vez (curso ou material)." }, { status: 400 });
    if (!reason || reason.length < 3) return NextResponse.json({ error: "Informe uma justificativa válida para a liberação." }, { status: 400 });

    const targetUser = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!targetUser) return NextResponse.json({ error: "Usuário destinatário não encontrado." }, { status: 404 });

    if (courseId) {
      const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
      if (!course) return NextResponse.json({ error: "Curso não encontrado." }, { status: 404 });

      const existingEnrollment = await db.query.enrollments.findFirst({
        where: and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)),
      });

      if (!existingEnrollment) {
        await db.insert(enrollments).values({
          userId,
          courseId,
          progress: 0,
        });
      }
    }

    const [grant] = await db.insert(manualAccessGrants).values({
      userId,
      courseId,
      materialId,
      grantedBy: admin.id,
      reason,
    }).returning();

    await db.insert(adminAuditLogs).values({
      adminEmail: SUPER_ADMIN_EMAIL,
      action: "manual_access_grant",
      targetName: targetUser.name,
      targetEmail: targetUser.email,
      details: JSON.stringify({ grantId: grant.id, userId, courseId, materialId, reason }),
    });

    return NextResponse.json({ grant, message: "Acesso pago liberado com sucesso para o usuário!" }, { status: 201 });
  } catch (error) {
    console.error("Erro ao conceder acesso pago:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível liberar o acesso." }, { status: 500 });
  }
}
