import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray, or, isNull } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  attendances,
  classSessions,
  courseOfferStudents,
  courseOfferTeacherAssignments,
  courseOffers,
  courses,
  users,
} from "@/drizzle/schema";
import { canManageCourseOffer, type AdminAuthSession } from "@/lib/admin-auth";

const SUPER_ADMIN_EMAIL = "palafozanderson@gmail.com";
const GLOBAL_ROLES = new Set(["admin", "super_admin"]);
const ATTENDANCE_STATUSES = new Set(["present", "absent", "justified"]);

type SessionPayload = {
  id?: number;
  offerId?: number;
  courseId?: number;
  title?: string;
  description?: string | null;
  modality?: "individual" | "group" | "hybrid";
  scheduledAt?: string;
  durationMinutes?: number;
  status?: "scheduled" | "completed" | "cancelled";
  attendanceRecords?: Array<{ studentId: number; status: "present" | "absent" | "justified"; notes?: string }>;
};

async function requireAdminOrTeacher(): Promise<AdminAuthSession | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!session?.user || !email) return null;
  if (email === SUPER_ADMIN_EMAIL || GLOBAL_ROLES.has(session.user.role || "") || session.user.role === "professor") {
    return session as AdminAuthSession;
  }
  return null;
}

function hasGlobalAccess(session: AdminAuthSession) {
  return session.user.email?.toLowerCase() === SUPER_ADMIN_EMAIL || GLOBAL_ROLES.has(session.user.role || "");
}

async function getManagedOfferIds(userId: number) {
  const offers = await db
    .select({ id: courseOffers.id })
    .from(courseOffers)
    .leftJoin(
      courseOfferTeacherAssignments,
      and(
        eq(courseOfferTeacherAssignments.offerId, courseOffers.id),
        eq(courseOfferTeacherAssignments.teacherId, userId)
      )
    )
    .where(or(eq(courseOffers.ownerTeacherId, userId), eq(courseOfferTeacherAssignments.teacherId, userId)));
  return offers.map((offer) => offer.id);
}

async function canManage(session: NonNullable<Awaited<ReturnType<typeof requireAdminOrTeacher>>>, offerId: number) {
  return hasGlobalAccess(session) || canManageCourseOffer(session, offerId);
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminOrTeacher();
    if (!session) {
      return NextResponse.json({ error: "Acesso restrito a professores e administradores." }, { status: 403 });
    }

    const rawPage = Number(request.nextUrl.searchParams.get("page") || "1");
    const rawPageSize = Number(request.nextUrl.searchParams.get("pageSize") || "50");
    const page = Number.isFinite(rawPage) ? Math.max(1, Math.floor(rawPage)) : 1;
    const pageSize = Number.isFinite(rawPageSize) ? Math.min(100, Math.max(1, Math.floor(rawPageSize))) : 50;
    const offset = (page - 1) * pageSize;

    let allowedOfferIds: number[] | null = null;
    if (!hasGlobalAccess(session)) {
      const email = session.user.email?.toLowerCase();
      const teacher = email ? await db.query.users.findFirst({ where: eq(users.email, email) }) : null;
      if (!teacher || teacher.role !== "professor") {
        return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
      }
      allowedOfferIds = await getManagedOfferIds(teacher.id);
    }

    const sessionCondition = allowedOfferIds === null
      ? undefined
      : allowedOfferIds.length
        ? inArray(classSessions.offerId, allowedOfferIds)
        : inArray(classSessions.id, []);

    const sessionsQuery = db.select().from(classSessions);
    const sessions = await (sessionCondition
      ? sessionsQuery.where(sessionCondition).orderBy(desc(classSessions.scheduledAt)).limit(pageSize).offset(offset)
      : sessionsQuery.orderBy(desc(classSessions.scheduledAt)).limit(pageSize).offset(offset));
    const sessionIds = sessions.map((item) => item.id);

    const [availableCourses, students, allAttendances] = await Promise.all([
      allowedOfferIds === null
        ? db.select({ id: courses.id, title: courses.title, level: courses.level }).from(courses).where(isNull(courses.deletedAt)).limit(500)
        : allowedOfferIds.length
          ? db.selectDistinct({ id: courses.id, title: courses.title, level: courses.level }).from(courseOffers).innerJoin(courses, eq(courseOffers.courseId, courses.id)).where(inArray(courseOffers.id, allowedOfferIds)).limit(500)
          : Promise.resolve([]),
      allowedOfferIds === null
        ? db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(and(eq(users.role, "user"), isNull(users.deletedAt))).limit(500)
        : allowedOfferIds.length
          ? db.selectDistinct({ id: users.id, name: users.name, email: users.email }).from(courseOfferStudents).innerJoin(users, eq(courseOfferStudents.userId, users.id)).where(inArray(courseOfferStudents.offerId, allowedOfferIds)).limit(500)
          : Promise.resolve([]),
      sessionIds.length
        ? db.select().from(attendances).where(inArray(attendances.sessionId, sessionIds))
        : Promise.resolve([]),
    ]);

    return NextResponse.json({
      sessions,
      courses: availableCourses,
      students,
      attendances: allAttendances,
      pagination: { page, pageSize, returned: sessions.length, offset },
    });
  } catch (error) {
    console.error("Erro ao carregar sessões de chamada:", error);
    return NextResponse.json({ error: "Não foi possível carregar as sessões." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAdminOrTeacher();
    if (!session) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
    const body = await request.json() as SessionPayload;
    const id = Number(body.id);
    const offerId = Number(body.offerId);
    if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(offerId) || offerId <= 0 || !body.title?.trim() || !body.scheduledAt) {
      return NextResponse.json({ error: "Sessão, turma, título e data são obrigatórios." }, { status: 400 });
    }
    if (!await canManage(session, offerId)) return NextResponse.json({ error: "Acesso negado à turma." }, { status: 403 });
    const scheduledAt = new Date(body.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) return NextResponse.json({ error: "Data inválida." }, { status: 400 });
    const [updated] = await db.update(classSessions).set({
      title: body.title.trim(),
      description: body.description?.trim() || null,
      scheduledAt,
      durationMinutes: body.durationMinutes ? Number(body.durationMinutes) : 60,
      status: body.status || "scheduled",
      updatedAt: new Date(),
    }).where(and(eq(classSessions.id, id), eq(classSessions.offerId, offerId))).returning();
    if (!updated) return NextResponse.json({ error: "Sessão não encontrada nessa turma." }, { status: 404 });
    return NextResponse.json({ session: updated });
  } catch (error) {
    console.error("Erro ao atualizar sessão:", error);
    return NextResponse.json({ error: "Não foi possível atualizar a sessão." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireAdminOrTeacher();
    if (!session) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
    const body = await request.json() as { id?: number; offerId?: number };
    const id = Number(body.id);
    const offerId = Number(body.offerId);
    if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(offerId) || offerId <= 0) {
      return NextResponse.json({ error: "Sessão e turma são obrigatórias." }, { status: 400 });
    }
    if (!await canManage(session, offerId)) return NextResponse.json({ error: "Acesso negado à turma." }, { status: 403 });
    const deleted = await db.delete(classSessions).where(and(eq(classSessions.id, id), eq(classSessions.offerId, offerId))).returning({ id: classSessions.id });
    if (!deleted.length) return NextResponse.json({ error: "Sessão não encontrada nessa turma." }, { status: 404 });
    return NextResponse.json({ deleted: deleted[0].id });
  } catch (error) {
    console.error("Erro ao excluir sessão:", error);
    return NextResponse.json({ error: "Não foi possível excluir a sessão." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminOrTeacher();
    if (!session) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
    const body = await request.json() as SessionPayload;
    const offerId = Number(body.offerId);
    const title = body.title?.trim();
    const scheduledAt = new Date(body.scheduledAt || "");
    if (!Number.isInteger(offerId) || offerId <= 0 || !title || title.length > 255 || Number.isNaN(scheduledAt.getTime())) {
      return NextResponse.json({ error: "Turma, título e data válidos são obrigatórios." }, { status: 400 });
    }
    if (!await canManage(session, offerId)) return NextResponse.json({ error: "Acesso negado à turma." }, { status: 403 });

    const email = session.user.email?.toLowerCase();
    const teacher = email ? await db.query.users.findFirst({ where: eq(users.email, email) }) : null;
    if (!teacher) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 403 });
    const offer = await db.query.courseOffers.findFirst({ where: eq(courseOffers.id, offerId) });
    if (!offer || (body.courseId && Number(body.courseId) !== offer.courseId)) {
      return NextResponse.json({ error: "Turma ou curso inválido." }, { status: 400 });
    }

    const records = Array.isArray(body.attendanceRecords) ? body.attendanceRecords : [];
    if (records.length > 500 || records.some((record) => !Number.isInteger(Number(record.studentId)) || Number(record.studentId) <= 0 || !ATTENDANCE_STATUSES.has(record.status))) {
      return NextResponse.json({ error: "Lista de presença inválida." }, { status: 400 });
    }
    const studentIds = [...new Set(records.map((record) => Number(record.studentId)))];
    if (studentIds.length) {
      const enrolled = await db.select({ userId: courseOfferStudents.userId })
        .from(courseOfferStudents)
        .where(and(inArray(courseOfferStudents.offerId, [offerId]), inArray(courseOfferStudents.userId, studentIds)));
      const enrolledIds = new Set(enrolled.map((row) => row.userId).filter((id): id is number => id !== null));
      if (studentIds.some((id) => !enrolledIds.has(id))) {
        return NextResponse.json({ error: "A lista contém alunos que não pertencem a esta turma." }, { status: 403 });
      }
    }

    const [newSession] = await db.insert(classSessions).values({
      courseId: offer.courseId,
      offerId,
      teacherId: teacher.id,
      title,
      description: body.description?.trim() || null,
      modality: body.modality || "group",
      scheduledAt,
      durationMinutes: body.durationMinutes ? Number(body.durationMinutes) : 60,
      status: body.status || "scheduled",
    }).returning();

    if (records.length) {
      await db.insert(attendances).values(records.map((record) => ({
        sessionId: newSession.id,
        studentId: Number(record.studentId),
        present: record.status === "present",
        status: record.status,
        notes: record.notes?.trim() || null,
      })));
    }

    return NextResponse.json({ session: newSession, message: "Chamada criada e salva com sucesso!" }, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar chamada:", error);
    return NextResponse.json({ error: "Não foi possível salvar a chamada." }, { status: 500 });
  }
}
