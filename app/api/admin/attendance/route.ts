import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { attendances, classSessions, courses, users } from "@/drizzle/schema";

async function canManageAttendance() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  return session.user.role === "admin" || session.user.role === "professor";
}

export async function GET() {
  if (!(await canManageAttendance())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const rows = await db.select({
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
  if (!(await canManageAttendance())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const body = await request.json() as {
      title?: string;
      courseId?: number | null;
      scheduledAt?: string;
      modality?: string;
      attendance?: Array<{ studentId: number; status: string; notes?: string }>;
    };
    if (!body.title?.trim() || !body.scheduledAt) return NextResponse.json({ error: "Título e data da sessão são obrigatórios." }, { status: 400 });

    const [session] = await db.insert(classSessions).values({
      title: body.title.trim(),
      courseId: body.courseId || null,
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
