import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { attendances, classSessions, courses, users } from "@/drizzle/schema";

const SUPER_ADMIN_EMAIL = "palafozanderson@gmail.com";

async function requireAdminOrTeacher() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!session?.user) return null;
  const role = session.user.role;
  if (email === SUPER_ADMIN_EMAIL || role === "admin" || role === "professor") {
    return session;
  }
  return null;
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

    const [sessions, availableCourses, students, allAttendances] = await Promise.all([
      db.select().from(classSessions).orderBy(desc(classSessions.scheduledAt)).limit(pageSize).offset(offset),
      db.select({ id: courses.id, title: courses.title, level: courses.level }).from(courses).where(isNull(courses.deletedAt)).limit(500),
      db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(and(eq(users.role, "user"), isNull(users.deletedAt))).limit(500),
      db.select().from(attendances).limit(2000),
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

export async function POST(request: Request) {
  try {
    const session = await requireAdminOrTeacher();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
    }

    const body = await request.json();
    const { courseId, title, description, modality, scheduledAt, durationMinutes, attendanceRecords } = body;

    if (!title || !scheduledAt) {
      return NextResponse.json({ error: "Título e data da aula são obrigatórios." }, { status: 400 });
    }

    const teacherUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email || SUPER_ADMIN_EMAIL),
    });

    const teacherId = teacherUser?.id || 1;

    const newSession = await db.insert(classSessions).values({
      courseId: courseId ? Number(courseId) : null,
      teacherId,
      title,
      description: description || null,
      modality: modality || "group",
      scheduledAt: new Date(scheduledAt),
      durationMinutes: durationMinutes ? Number(durationMinutes) : 60,
      status: "scheduled",
    }).returning();

    const sessionId = newSession[0].id;

    if (Array.isArray(attendanceRecords) && attendanceRecords.length > 0) {
      const valuesToInsert = attendanceRecords.map((rec: { studentId: number; status: "present" | "absent" | "justified"; notes?: string }) => ({
        sessionId,
        studentId: Number(rec.studentId),
        present: rec.status === "present",
        status: rec.status || "present",
        notes: rec.notes || null,
      }));

      await db.insert(attendances).values(valuesToInsert);
    }

    return NextResponse.json({ session: newSession[0], message: "Chamada criada e salva com sucesso!" }, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar chamada:", error);
    return NextResponse.json({ error: "Não foi possível salvar a chamada." }, { status: 500 });
  }
}
