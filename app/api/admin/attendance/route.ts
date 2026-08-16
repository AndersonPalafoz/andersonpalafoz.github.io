import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { attendances, classSessions, courses, users } from "@/drizzle/schema";

async function canManageAttendance() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
  if (!user || (user.role !== "admin" && user.role !== "professor")) return null;
  return user;
}

export async function GET() {
  const user = await canManageAttendance();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const rows = await db.select({
    attendanceId: attendances.id,
    studentId: users.id,
    sessionId: classSessions.id,
    sessionTitle: classSessions.title,
    scheduledAt: classSessions.scheduledAt,
    courseTitle: courses.title,
    studentName: users.name,
    studentEmail: users.email,
    status: attendances.status,
    notes: attendances.notes,
  }).from(attendances)
    .innerJoin(classSessions, eq(attendances.sessionId, classSessions.id))
    .innerJoin(users, eq(attendances.studentId, users.id))
    .leftJoin(courses, eq(classSessions.courseId, courses.id))
    .orderBy(asc(classSessions.scheduledAt), asc(users.name));

  return NextResponse.json({ records: rows });
}

export async function POST(request: NextRequest) {
  const user = await canManageAttendance();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  try {
    const body = await request.json() as {
      action?: "createSession" | "bulkUpdate";
      records?: Array<{ attendanceId: number; sessionId: number; status: "present" | "absent" | "justified" }>;
      title?: string;
      courseId?: number | null;
      scheduledAt?: string;
      modality?: "individual" | "group" | "hybrid";
      attendance?: Array<{ studentId: number; status: "present" | "absent" | "justified"; notes?: string }>;
    };
    if (body.action === "bulkUpdate") {
      if (!body.records?.length) return NextResponse.json({ error: "Nenhum registro foi selecionado." }, { status: 400 });
      for (const record of body.records) {
        await db.update(attendances).set({ status: record.status, present: record.status === "present" }).where(and(eq(attendances.id, record.attendanceId), eq(attendances.sessionId, record.sessionId)));
      }
      return NextResponse.json({ updated: body.records.length });
    }

    if (!body.title?.trim() || !body.scheduledAt) return NextResponse.json({ error: "Título e data da sessão são obrigatórios." }, { status: 400 });

    const [session] = await db.insert(classSessions).values({
      title: body.title.trim(),
      courseId: body.courseId || null,
      teacherId: user.id,
      scheduledAt: new Date(body.scheduledAt),
      modality: body.modality || "group",
      status: "completed",
    }).returning();

    if (body.attendance?.length) {
      await db.insert(attendances).values(body.attendance.map((item) => ({
        sessionId: session.id,
        studentId: item.studentId,
        status: item.status,
        notes: item.notes || null,
      })));
    }

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar chamada:", error);
    return NextResponse.json({ error: "Não foi possível salvar a chamada." }, { status: 500 });
  }
}
