import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { enrollments, courses, users } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { notifyStudentAndTeacher } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar usuário pelo email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const userId = user[0].id;

    // Verificar se o curso existe
    const course = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (course.length === 0) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o usuário já está inscrito
    const existingEnrollment = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.courseId, courseId)
        )
      )
      .limit(1);

    if (existingEnrollment.length > 0) {
      return NextResponse.json(
        { error: "Você já está inscrito neste curso" },
        { status: 409 }
      );
    }

    // Criar inscrição
    const enrollment = await db
      .insert(enrollments)
      .values({
        userId,
        courseId,
        status: "active",
        enrolledAt: new Date(),
      })
      .returning();

    // Disparar e-mail para aluno e professor
    try {
      const studentRecord = user[0];
      const courseRecord = course[0];
      let teacherEmail = null;
      let teacherName = null;

      if (studentRecord.teacherId) {
        const teacherRec = await db.query.users.findFirst({ where: eq(users.id, studentRecord.teacherId) });
        if (teacherRec) {
          teacherEmail = teacherRec.email;
          teacherName = teacherRec.name;
        }
      }

      await notifyStudentAndTeacher({
        studentEmail: studentRecord.email,
        studentName: studentRecord.name,
        teacherEmail,
        teacherName,
        subject: `Nova Matrícula no Curso: ${courseRecord.title}`,
        messageHtml: `<p>O aluno <b>${studentRecord.name || studentRecord.email}</b> realizou matrícula no curso <b>${courseRecord.title}</b>.</p>`,
      });
    } catch (mailErr) {
      console.error("Erro ao enviar e-mail de matrícula:", mailErr);
    }

    return NextResponse.json(enrollment[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao inscrever:", error);
    return NextResponse.json(
      { error: "Erro ao inscrever no curso" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Buscar usuário pelo email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const userId = user[0].id;

    // Listar inscrições do usuário
    const userEnrollments = await db
      .select({
        id: enrollments.id,
        courseId: enrollments.courseId,
        progress: enrollments.progress,
        status: enrollments.status,
        enrolledAt: enrollments.enrolledAt,
        completedAt: enrollments.completedAt,
        course: courses,
      })
      .from(enrollments)
      .leftJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.userId, userId));

    return NextResponse.json(userEnrollments);
  } catch (error) {
    console.error("Erro ao buscar inscrições:", error);
    return NextResponse.json(
      { error: "Erro ao buscar inscrições" },
      { status: 500 }
    );
  }
}
