import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { courses, enrollments, users } from "@/drizzle/schema";
import { ADMIN_AUDIT_ACTIONS, logAdminActivity } from "@/lib/admin-audit";

const SUPER_ADMIN_EMAIL = "palafozanderson@gmail.com";

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();

  if (!session?.user || email !== SUPER_ADMIN_EMAIL) {
    return null;
  }

  return session;
}

function parsePositiveInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function serializeEnrollment(row: {
  enrollment: typeof enrollments.$inferSelect;
  student: typeof users.$inferSelect;
  course: typeof courses.$inferSelect;
}) {
  return {
    id: row.enrollment.id,
    userId: row.enrollment.userId,
    courseId: row.enrollment.courseId,
    progress: row.enrollment.progress,
    status: row.enrollment.status,
    enrolledAt: row.enrollment.enrolledAt,
    completedAt: row.enrollment.completedAt,
    student: {
      id: row.student.id,
      name: row.student.name,
      email: row.student.email,
      approvalStatus: row.student.approvalStatus,
    },
    course: {
      id: row.course.id,
      title: row.course.title,
      level: row.course.level,
    },
  };
}

// GET /api/admin/enrollments - dados para o painel de matrículas.
export async function GET() {
  try {
    const session = await requireSuperAdmin();
    if (!session) {
      return NextResponse.json({ error: "Acesso restrito ao super-admin." }, { status: 403 });
    }

    const [students, availableCourses, enrollmentRows] = await Promise.all([
      db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        approvalStatus: users.approvalStatus,
      })
        .from(users)
        .where(and(eq(users.role, "user"), isNull(users.deletedAt)))
        .orderBy(users.name),
      db.select({
        id: courses.id,
        title: courses.title,
        level: courses.level,
      })
        .from(courses)
        .where(isNull(courses.deletedAt))
        .orderBy(courses.title),
      db.select({
        enrollment: enrollments,
        student: users,
        course: courses,
      })
        .from(enrollments)
        .innerJoin(users, eq(enrollments.userId, users.id))
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .orderBy(desc(enrollments.enrolledAt)),
    ]);

    return NextResponse.json({
      students,
      courses: availableCourses,
      enrollments: enrollmentRows.map(serializeEnrollment),
    });
  } catch (error) {
    console.error("Erro ao carregar matrículas administrativas:", error);
    return NextResponse.json({ error: "Não foi possível carregar os dados de matrícula." }, { status: 500 });
  }
}

// POST /api/admin/enrollments - cria matrícula ou reativa uma matrícula cancelada.
export async function POST(request: Request) {
  try {
    const session = await requireSuperAdmin();
    if (!session) {
      return NextResponse.json({ error: "Acesso restrito ao super-admin." }, { status: 403 });
    }

    const body = await request.json();
    const userId = parsePositiveInteger(body?.userId);
    const courseId = parsePositiveInteger(body?.courseId);

    if (!userId || !courseId) {
      return NextResponse.json({ error: "Selecione um aluno e um curso válidos." }, { status: 400 });
    }

    const [student, course] = await Promise.all([
      db.query.users.findFirst({ where: and(eq(users.id, userId), isNull(users.deletedAt)) }),
      db.query.courses.findFirst({ where: and(eq(courses.id, courseId), isNull(courses.deletedAt)) }),
    ]);

    if (!student || student.role !== "user") {
      return NextResponse.json({ error: "Aluno não encontrado ou não disponível para matrícula." }, { status: 404 });
    }

    if (!course) {
      return NextResponse.json({ error: "Curso não encontrado ou arquivado." }, { status: 404 });
    }

    const existing = await db.query.enrollments.findFirst({
      where: and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)),
    });

    let enrollment;
    let action: (typeof ADMIN_AUDIT_ACTIONS)[keyof typeof ADMIN_AUDIT_ACTIONS] = ADMIN_AUDIT_ACTIONS.CREATE;

    if (existing && existing.status !== "cancelled") {
      return NextResponse.json({ error: "Este aluno já está matriculado neste curso." }, { status: 409 });
    }

    if (existing) {
      enrollment = await db.update(enrollments)
        .set({ status: "active", progress: 0, completedAt: null, enrolledAt: new Date() })
        .where(eq(enrollments.id, existing.id))
        .returning();
      action = ADMIN_AUDIT_ACTIONS.RESTORE;
    } else {
      enrollment = await db.insert(enrollments)
        .values({ userId, courseId, status: "active", progress: 0, enrolledAt: new Date() })
        .returning();
    }

    await logAdminActivity({
      adminEmail: session.user?.email || SUPER_ADMIN_EMAIL,
      action,
      targetName: student.name,
      targetEmail: student.email,
      details: `${action === ADMIN_AUDIT_ACTIONS.RESTORE ? "Matrícula reativada" : "Aluno matriculado"} no curso "${course.title}".`,
    });

    return NextResponse.json({ enrollment: enrollment[0], message: existing ? "Matrícula reativada com progresso zerado." : "Aluno matriculado com sucesso." }, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error("Erro ao criar matrícula administrativa:", error);
    return NextResponse.json({ error: "Não foi possível concluir a matrícula." }, { status: 500 });
  }
}

// DELETE /api/admin/enrollments - cancela a matrícula sem apagar o histórico.
export async function DELETE(request: Request) {
  try {
    const session = await requireSuperAdmin();
    if (!session) {
      return NextResponse.json({ error: "Acesso restrito ao super-admin." }, { status: 403 });
    }

    const body = await request.json();
    const enrollmentId = parsePositiveInteger(body?.enrollmentId);
    if (!enrollmentId) {
      return NextResponse.json({ error: "Matrícula inválida." }, { status: 400 });
    }

    const row = await db.select({ enrollment: enrollments, student: users, course: courses })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.userId, users.id))
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.id, enrollmentId))
      .limit(1);

    if (row.length === 0) {
      return NextResponse.json({ error: "Matrícula não encontrada." }, { status: 404 });
    }

    if (row[0].enrollment.status === "cancelled") {
      return NextResponse.json({ error: "Esta matrícula já está desvinculada." }, { status: 409 });
    }

    const cancelled = await db.update(enrollments)
      .set({ status: "cancelled", progress: 0, completedAt: null })
      .where(eq(enrollments.id, enrollmentId))
      .returning();

    await logAdminActivity({
      adminEmail: session.user?.email || SUPER_ADMIN_EMAIL,
      action: ADMIN_AUDIT_ACTIONS.SOFT_DELETE,
      targetName: row[0].student.name,
      targetEmail: row[0].student.email,
      details: `Matrícula desvinculada do curso "${row[0].course.title}" sem apagar o histórico.`,
    });

    return NextResponse.json({ enrollment: cancelled[0], message: "Aluno desvinculado do curso com sucesso." });
  } catch (error) {
    console.error("Erro ao desvincular matrícula administrativa:", error);
    return NextResponse.json({ error: "Não foi possível desvincular a matrícula." }, { status: 500 });
  }
}
