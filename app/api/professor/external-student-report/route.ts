import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  externalClasses,
  externalStudents,
  users,
  externalClassAttendance,
  externalClassGrades,
  courseOffers,
  courseOfferStudents,
  courseOfferAttendance,
} from "@/drizzle/schema";
import { and, eq, or, ilike, isNull } from "drizzle-orm";
import { resolveAndAuthorizeAcademicContext } from "@/lib/academic-context";
import type { AdminAuthSession } from "@/lib/admin-auth";

const summarizeAttendance = (attendance: Array<{ date: string; status: string }>, maxAbsencePercent: number) => {
  const present = attendance.filter((item) => item.status === "present").length;
  const absent = attendance.filter((item) => item.status === "absent").length;
  const late = attendance.filter((item) => item.status === "late").length;
  const totalSessions = attendance.length;
  const absencePercent = totalSessions > 0 ? Number(((absent / totalSessions) * 100).toFixed(1)) : 0;
  return {
    totalSessions,
    present,
    absent,
    late,
    attendanceRate: totalSessions ? Number(((present / totalSessions) * 100).toFixed(1)) : null,
    absencePercent,
    isAboveAbsenceLimit: totalSessions > 0 && absencePercent > maxAbsencePercent,
  };
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "professor" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const courseOfferStudentId = searchParams.get("courseOfferStudentId");
    const offerId = searchParams.get("offerId");
    const classId = searchParams.get("classId");
    const searchName = searchParams.get("search");
    if (!studentId && !courseOfferStudentId && !searchName) {
      return NextResponse.json({ error: "ID do aluno, matrícula acadêmica ou termo de busca não informado." }, { status: 400 });
    }

    const email = session.user.email;
    if (!email) return NextResponse.json({ error: "E-mail não encontrado na sessão." }, { status: 400 });
    const teacher = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!teacher) return NextResponse.json({ error: "Professor não encontrado." }, { status: 404 });

    const contextInput = offerId || classId ? { offerId, classId } : null;
    const contextAccess = contextInput
      ? await resolveAndAuthorizeAcademicContext(session as AdminAuthSession, contextInput, "read")
      : null;
    if (contextInput && (!contextAccess || !contextAccess.allowed)) {
      return NextResponse.json({ error: "Acesso negado a este contexto acadêmico." }, { status: 403 });
    }

    if (contextAccess?.allowed && contextAccess.context.kind === "offer" && contextAccess.context.offerId) {
      const offer = contextAccess.context.offer;
      const classRecord = contextAccess.context.externalClass;
      const offerStudent = courseOfferStudentId
        ? await db.query.courseOfferStudents.findFirst({ where: and(eq(courseOfferStudents.id, Number(courseOfferStudentId)), eq(courseOfferStudents.offerId, contextAccess.context.offerId)) })
        : studentId
          ? await db.query.courseOfferStudents.findFirst({ where: and(eq(courseOfferStudents.offerId, contextAccess.context.offerId), eq(courseOfferStudents.externalStudentId, Number(studentId))) })
          : await db.query.courseOfferStudents.findFirst({ where: and(eq(courseOfferStudents.offerId, contextAccess.context.offerId), ilike(courseOfferStudents.name, `%${searchName}%`)) });
      if (!offerStudent) return NextResponse.json({ error: "Matrícula acadêmica não encontrada nesta oferta." }, { status: 404 });

      const externalStudent = offerStudent.externalStudentId
        ? await db.query.externalStudents.findFirst({ where: eq(externalStudents.id, offerStudent.externalStudentId) })
        : null;
      const [grades, attendanceRows] = await Promise.all([
        db.select({ id: externalClassGrades.id, assessmentTitle: externalClassGrades.assessmentTitle, score: externalClassGrades.score, maxScore: externalClassGrades.maxScore, feedback: externalClassGrades.feedback, createdAt: externalClassGrades.createdAt, offerId: externalClassGrades.offerId, courseOfferStudentId: externalClassGrades.courseOfferStudentId })
          .from(externalClassGrades)
          .where(eq(externalClassGrades.courseOfferStudentId, offerStudent.id)),
        db.select({ date: courseOfferAttendance.date, attendanceData: courseOfferAttendance.attendanceData })
          .from(courseOfferAttendance)
          .where(eq(courseOfferAttendance.offerId, contextAccess.context.offerId)),
      ]);
      const attendance = attendanceRows.flatMap((row) => {
        try {
          const parsed = JSON.parse(row.attendanceData) as Record<string, string>;
          const status = parsed[String(offerStudent.id)];
          return status ? [{ date: row.date, status }] : [];
        } catch { return []; }
      });
      const maxAbsencePercent = offer?.maxAbsencePercent ?? classRecord?.maxAbsencePercent ?? 25;
      const enrollment = {
        classId: classRecord?.id ?? null,
        offerId: contextAccess.context.offerId,
        courseOfferStudentId: offerStudent.id,
        institution: offer?.institution ?? classRecord?.institution ?? null,
        className: offer?.offerName ?? classRecord?.className ?? "Oferta acadêmica",
        courseName: classRecord?.courseName ?? `Curso #${offer?.courseId ?? ""}`,
        academicTerm: offer?.academicTerm ?? classRecord?.academicTerm ?? "",
        status: offerStudent.status,
        notes: offerStudent.notes ?? externalStudent?.notes ?? null,
        updatedAt: offerStudent.updatedAt,
        maxAbsencePercent,
        grades,
        attendance,
        attendanceSummary: summarizeAttendance(attendance, maxAbsencePercent),
      };
      return NextResponse.json({
        success: true,
        report: {
          context: { offerId: contextAccess.context.offerId, classId: contextAccess.context.classId, courseId: contextAccess.context.courseId },
          studentInfo: { id: externalStudent?.id ?? offerStudent.id, courseOfferStudentId: offerStudent.id, name: offerStudent.socialName || offerStudent.name, email: offerStudent.email, studentIdNumber: offerStudent.studentIdNumber, userId: offerStudent.userId },
          enrollments: [enrollment],
        },
      });
    }

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
      const maxAbsencePercent = classItem.maxAbsencePercent ?? 25;
      return { classId: classItem.id, offerId: null, courseOfferStudentId: null, institution: classItem.institution, className: classItem.className, courseName: classItem.courseName, academicTerm: classItem.academicTerm, status: student.status, notes: student.notes, updatedAt: student.updatedAt, maxAbsencePercent, grades, attendance, attendanceSummary: summarizeAttendance(attendance, maxAbsencePercent) };
    }));
    return NextResponse.json({ success: true, report: { context: { offerId: null, classId: classRecord.id, courseId: null }, studentInfo: { id: studentRecord.id, courseOfferStudentId: null, name: studentRecord.name, email: studentRecord.email, studentIdNumber: studentRecord.studentIdNumber, userId: studentRecord.userId }, enrollments } });
  } catch (error) {
    console.error("Erro ao gerar boletim individual:", error);
    return NextResponse.json({ error: "Erro interno ao gerar boletim." }, { status: 500 });
  }
}
