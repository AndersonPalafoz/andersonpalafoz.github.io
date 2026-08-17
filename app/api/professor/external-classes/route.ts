import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { externalClasses, externalStudents, users } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "professor" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const email = session.user.email;
    if (!email) return NextResponse.json({ error: "E-mail não encontrado na sessão." }, { status: 400 });

    const teacher = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!teacher) return NextResponse.json({ error: "Professor não encontrado." }, { status: 404 });

    const classes = session.user.role === "admin"
      ? await db.select().from(externalClasses).orderBy(desc(externalClasses.createdAt))
      : await db.select().from(externalClasses).where(eq(externalClasses.teacherId, teacher.id)).orderBy(desc(externalClasses.createdAt));
    
    const result = [];
    for (const cls of classes) {
      const students = await db.select().from(externalStudents).where(eq(externalStudents.externalClassId, cls.id));
      
      const totalStudents = students.length;
      const activeStudents = students.filter(s => s.status === "active").length;
      const completedStudents = students.filter(s => s.status === "completed").length;

      result.push({
        ...cls,
        students,
        stats: {
          total: totalStudents,
          active: activeStudents,
          completed: completedStudents,
        }
      });
    }

    return NextResponse.json({ success: true, classes: result });
  } catch (error) {
    console.error("Erro ao listar turmas externas:", error);
    return NextResponse.json({ error: "Erro interno ao buscar turmas externas." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "professor" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const email = session.user.email;
    if (!email) return NextResponse.json({ error: "E-mail não encontrado na sessão." }, { status: 400 });

    const teacher = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!teacher) return NextResponse.json({ error: "Professor não encontrado." }, { status: 404 });

    const body = await request.json();
    const { action, institution, className, courseName, academicTerm, description, classId, studentName, studentEmail, studentIdNumber, studentNotes, studentStatus, studentId } = body;

    if (action === "createClass") {
      if (!institution || !className || !courseName || !academicTerm) {
        return NextResponse.json({ error: "Instituição, nome da turma, nome do curso e período são obrigatórios." }, { status: 400 });
      }

      const inserted = await db.insert(externalClasses).values({
        teacherId: teacher.id,
        institution: institution.trim(),
        className: className.trim(),
        courseName: courseName.trim(),
        academicTerm: academicTerm.trim(),
        description: description ? description.trim() : null,
      }).returning();

      return NextResponse.json({ success: true, classItem: inserted[0] });
    }

    if (action === "updateClass") {
      if (!classId || !institution || !className || !courseName || !academicTerm) {
        return NextResponse.json({ error: "Dados incompletos para atualização." }, { status: 400 });
      }

      const existing = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, Number(classId)) });
      if (!existing) return NextResponse.json({ error: "Turma não encontrada." }, { status: 404 });
      if (session.user.role !== "admin" && existing.teacherId !== teacher.id) {
        return NextResponse.json({ error: "Acesso negado para editar esta turma." }, { status: 403 });
      }

      const updated = await db.update(externalClasses)
        .set({
          institution: institution.trim(),
          className: className.trim(),
          courseName: courseName.trim(),
          academicTerm: academicTerm.trim(),
          description: description ? description.trim() : null,
          updatedAt: new Date(),
        })
        .where(eq(externalClasses.id, Number(classId)))
        .returning();

      return NextResponse.json({ success: true, classItem: updated[0] });
    }

    if (action === "addStudent") {
      if (!classId || !studentName) {
        return NextResponse.json({ error: "ID da turma e nome do aluno são obrigatórios." }, { status: 400 });
      }

      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, Number(classId)) });
      if (!existingClass) return NextResponse.json({ error: "Turma não encontrada." }, { status: 404 });
      if (session.user.role !== "admin" && existingClass.teacherId !== teacher.id) {
        return NextResponse.json({ error: "Acesso negado para gerenciar alunos desta turma." }, { status: 403 });
      }

      const inserted = await db.insert(externalStudents).values({
        externalClassId: Number(classId),
        name: studentName.trim(),
        email: studentEmail ? studentEmail.trim() : null,
        studentIdNumber: studentIdNumber ? studentIdNumber.trim() : null,
        status: studentStatus ? studentStatus.trim() : "active",
        notes: studentNotes ? studentNotes.trim() : null,
      }).returning();

      return NextResponse.json({ success: true, student: inserted[0] });
    }

    if (action === "updateStudentStatus") {
      if (!studentId || !studentStatus) {
        return NextResponse.json({ error: "ID do aluno e status são obrigatórios." }, { status: 400 });
      }

      const student = await db.query.externalStudents.findFirst({ where: eq(externalStudents.id, Number(studentId)) });
      if (!student) return NextResponse.json({ error: "Aluno não encontrado." }, { status: 404 });

      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, student.externalClassId) });
      if (existingClass && session.user.role !== "admin" && existingClass.teacherId !== teacher.id) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
      }

      const updated = await db.update(externalStudents)
        .set({
          status: studentStatus.trim(),
          updatedAt: new Date(),
        })
        .where(eq(externalStudents.id, Number(studentId)))
        .returning();

      return NextResponse.json({ success: true, student: updated[0] });
    }

    if (action === "deleteStudent") {
      if (!studentId) {
        return NextResponse.json({ error: "ID do aluno não informado." }, { status: 400 });
      }

      const student = await db.query.externalStudents.findFirst({ where: eq(externalStudents.id, Number(studentId)) });
      if (student) {
        const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, student.externalClassId) });
        if (existingClass && session.user.role !== "admin" && existingClass.teacherId !== teacher.id) {
          return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
        }
        await db.delete(externalStudents).where(eq(externalStudents.id, Number(studentId)));
      }

      return NextResponse.json({ success: true });
    }

    if (action === "deleteClass") {
      if (!classId) {
        return NextResponse.json({ error: "ID da turma não informado." }, { status: 400 });
      }

      const existingClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, Number(classId)) });
      if (existingClass) {
        if (session.user.role !== "admin" && existingClass.teacherId !== teacher.id) {
          return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
        }
        await db.delete(externalStudents).where(eq(externalStudents.externalClassId, Number(classId)));
        await db.delete(externalClasses).where(eq(externalClasses.id, Number(classId)));
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    console.error("Erro na API de turmas externas:", error);
    return NextResponse.json({ error: "Erro interno ao processar requisição." }, { status: 500 });
  }
}
