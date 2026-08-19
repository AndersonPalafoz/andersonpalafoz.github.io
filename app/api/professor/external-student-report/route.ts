import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { externalClasses, externalStudents, users, externalClassAttendance, externalClassGrades } from "@/drizzle/schema";
import { and, eq, or, ilike } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "professor" && session.user.role !== "admin")) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const searchName = searchParams.get("search");
    if (!studentId && !searchName) return NextResponse.json({ error: "ID do aluno ou termo de busca não informado." }, { status: 400 });
    const email = session.user.email;
    if (!email) return NextResponse.json({ error: "E-mail não encontrado na sessão." }, { status: 400 });
    const teacher = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!teacher) return NextResponse.json({ error: "Professor não encontrado." }, { status: 404 });

    const studentRecord = studentId
      ? await db.query.externalStudents.findFirst({ where: eq(externalStudents.id, Number(studentId)) })
      : await db.query.externalStudents.findFirst({ where: ilike(externalStudents.name, `%${searchName}%`) });
    if (!studentRecord) return NextResponse.json({ error: "Aluno externo não encontrado." }, { status: 404 });
    const classRecord = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, studentRecord.externalClassId) });
    if (!classRecord) return NextResponse.json({ error: "Turma do aluno não encontrada." }, { status: 404 });
    if (session.user.role !== "admin" && classRecord.teacherId !== teacher.id) return NextResponse.json({ error: "Acesso negado a este boletim." }, { status: 403 });

    const identityFilter = or(eq(externalStudents.name, studentRecord.name), studentRecord.email ? eq(externalStudents.email, studentRecord.email) : eq(externalStudents.id, studentRecord.id));
    const enrollmentFilter = session.user.role === "admin" ? identityFilter : and(identityFilter, eq(externalClasses.teacherId, teacher.id));
    const records = await db.select({ student: externalStudents, classItem: externalClasses }).from(externalStudents).innerJoin(externalClasses, eq(externalStudents.externalClassId, externalClasses.id)).where(enrollmentFilter);

    const enrollments = await Promise.all(records.map(async ({ student, classItem }) => {
      const [grades, attendanceRows] = await Promise.all([
        db.select({ id: externalClassGrades.id, assessmentTitle: externalClassGrades.assessmentTitle, score: externalClassGrades.score, maxScore: externalClassGrades.maxScore, feedback: externalClassGrades.feedback, createdAt: externalClassGrades.createdAt }).from(externalClassGrades).where(and(eq(externalClassGrades.externalClassId, classItem.id), eq(externalClassGrades.studentId, student.id))),
        db.select({ date: externalClassAttendance.date, attendanceData: externalClassAttendance.attendanceData }).from(externalClassAttendance).where(eq(externalClassAttendance.externalClassId, classItem.id)),
      ]);
      const attendance = attendanceRows.flatMap((row) => {
        try {
          const parsed = JSON.parse(row.attendanceData) as Record<string, string>;
          const status = parsed[String(student.id)];
          return status ? [{ date: row.date, status }] : [];
        } catch { return []; }
      });
      const present = attendance.filter((item) => item.status === "present").length;
      const absent = attendance.filter((item) => item.status === "absent").length;
      const late = attendance.filter((item) => item.status === "late").length;
      const maxAbsencePercent = classItem.maxAbsencePercent ?? 25;
      const totalSessions = attendance.length;
      const absencePercent = totalSessions > 0 ? Number(((absent / totalSessions) * 100).toFixed(1)) : 0;
      const isAboveAbsenceLimit = totalSessions > 0 && absencePercent > maxAbsencePercent;
      return { classId: classItem.id, institution: classItem.institution, className: classItem.className, courseName: classItem.courseName, academicTerm: classItem.academicTerm, status: student.status, notes: student.notes, updatedAt: student.updatedAt, maxAbsencePercent, grades, attendance, attendanceSummary: { totalSessions, present, absent, late, attendanceRate: totalSessions ? Number(((present / totalSessions) * 100).toFixed(1)) : null, absencePercent, isAboveAbsenceLimit } };
    }));

    return NextResponse.json({ success: true, report: { studentInfo: { id: studentRecord.id, name: studentRecord.name, email: studentRecord.email, studentIdNumber: studentRecord.studentIdNumber }, enrollments } });
  } catch (error) { console.error("Erro ao gerar boletim individual:", error); return NextResponse.json({ error: "Erro interno ao gerar boletim." }, { status: 500 }); }
}
