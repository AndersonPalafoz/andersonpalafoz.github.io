import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { externalClasses, externalStudents, users } from "@/drizzle/schema";
import { and, eq, or, ilike } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "professor" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const searchName = searchParams.get("search");

    if (!studentId && !searchName) {
      return NextResponse.json({ error: "ID do aluno ou termo de busca não informado." }, { status: 400 });
    }

    const email = session.user.email;
    if (!email) return NextResponse.json({ error: "E-mail não encontrado na sessão." }, { status: 400 });

    const teacher = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!teacher) return NextResponse.json({ error: "Professor não encontrado." }, { status: 404 });

    // Buscar aluno por ID ou nome
    let studentRecord = null;
    if (studentId) {
      studentRecord = await db.query.externalStudents.findFirst({
        where: eq(externalStudents.id, Number(studentId)),
      });
    } else if (searchName) {
      studentRecord = await db.query.externalStudents.findFirst({
        where: ilike(externalStudents.name, `%${searchName}%`),
      });
    }

    if (!studentRecord) {
      return NextResponse.json({ error: "Aluno externo não encontrado." }, { status: 404 });
    }

    // Verificar se a turma pertence ao professor (ou se é admin)
    const classRecord = await db.query.externalClasses.findFirst({
      where: eq(externalClasses.id, studentRecord.externalClassId),
    });

    if (!classRecord) {
      return NextResponse.json({ error: "Turma do aluno não encontrada." }, { status: 404 });
    }

    if (session.user.role !== "admin" && classRecord.teacherId !== teacher.id) {
      return NextResponse.json({ error: "Acesso negado a este boletim." }, { status: 403 });
    }

    // Buscar todas as matrículas deste aluno pelo nome ou email em turmas do mesmo professor
    const identityFilter = or(
      eq(externalStudents.name, studentRecord.name),
      studentRecord.email ? eq(externalStudents.email, studentRecord.email) : eq(externalStudents.id, studentRecord.id),
    );
    const enrollmentFilter = session.user.role === "admin" ? identityFilter : and(identityFilter, eq(externalClasses.teacherId, teacher.id));
    const allStudentEnrollments = await db.select({ student: externalStudents, classItem: externalClasses })
      .from(externalStudents)
      .innerJoin(externalClasses, eq(externalStudents.externalClassId, externalClasses.id))
      .where(enrollmentFilter);

    const reportData = {
      studentInfo: {
        id: studentRecord.id,
        name: studentRecord.name,
        email: studentRecord.email,
        studentIdNumber: studentRecord.studentIdNumber,
      },
      enrollments: allStudentEnrollments.map(item => ({
        classId: item.classItem.id,
        institution: item.classItem.institution,
        className: item.classItem.className,
        courseName: item.classItem.courseName,
        academicTerm: item.classItem.academicTerm,
        status: item.student.status,
        notes: item.student.notes,
        updatedAt: item.student.updatedAt,
      })),
    };

    return NextResponse.json({ success: true, report: reportData });
  } catch (error) {
    console.error("Erro ao gerar boletim individual:", error);
    return NextResponse.json({ error: "Erro interno ao gerar boletim." }, { status: 500 });
  }
}
