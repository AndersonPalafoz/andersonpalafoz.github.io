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

    const classes = await db.select().from(externalClasses).orderBy(desc(externalClasses.createdAt));
    
    const result = [];
    for (const cls of classes) {
      const students = await db.select().from(externalStudents).where(eq(externalStudents.externalClassId, cls.id));
      result.push({
        ...cls,
        students,
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
    const { action, institution, className, courseName, academicTerm, description, classId, studentName, studentEmail, studentIdNumber, studentNotes, studentId } = body;

    if (action === "createClass") {
      if (!institution || !className || !courseName || !academicTerm) {
        return NextResponse.json({ error: "Instituição, nome da turma, nome do curso e período são obrigatórios." }, { status: 400 });
      }

      const inserted = await db.insert(externalClasses).values({
        institution: institution.trim(),
        className: className.trim(),
        courseName: courseName.trim(),
        academicTerm: academicTerm.trim(),
        teacherId: teacher.id,
        description: description ? description.trim() : null,
      }).returning();

      return NextResponse.json({ success: true, classItem: inserted[0] }, { status: 201 });
    }

    if (action === "addStudent") {
      if (!classId || !studentName) {
        return NextResponse.json({ error: "ID da turma e nome do aluno são obrigatórios." }, { status: 400 });
      }

      const inserted = await db.insert(externalStudents).values({
        externalClassId: Number(classId),
        name: studentName.trim(),
        email: studentEmail ? studentEmail.trim() : null,
        studentIdNumber: studentIdNumber ? studentIdNumber.trim() : null,
        status: "active",
        notes: studentNotes ? studentNotes.trim() : null,
      }).returning();

      return NextResponse.json({ success: true, student: inserted[0] }, { status: 201 });
    }

    if (action === "removeStudent") {
      if (!studentId) {
        return NextResponse.json({ error: "ID do aluno é obrigatório." }, { status: 400 });
      }

      await db.delete(externalStudents).where(eq(externalStudents.id, Number(studentId)));
      return NextResponse.json({ success: true });
    }

    if (action === "removeClass") {
      if (!classId) {
        return NextResponse.json({ error: "ID da turma é obrigatório." }, { status: 400 });
      }

      await db.delete(externalStudents).where(eq(externalStudents.externalClassId, Number(classId)));
      await db.delete(externalClasses).where(eq(externalClasses.id, Number(classId)));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    console.error("Erro ao gerenciar turma/aluno externo:", error);
    return NextResponse.json({ error: "Erro interno ao processar requisição." }, { status: 500 });
  }
}
