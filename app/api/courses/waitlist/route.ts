import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { courses, users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import postgres from "postgres";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const courseId = body.courseId ? Number(body.courseId) : null;
    if (!courseId) {
      return NextResponse.json({ error: "ID do curso inválido." }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    let userId: number | null = null;
    let email = body.email?.trim();

    if (session?.user?.email) {
      email = session.user.email;
      const user = await db.query.users.findFirst({ where: eq(users.email, email) });
      if (user) userId = user.id;
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Informe um e-mail válido para receber o aviso." }, { status: 400 });
    }

    const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
    if (!course) {
      return NextResponse.json({ error: "Curso não encontrado." }, { status: 404 });
    }

    // Inserção direta via postgres driver para evitar falhas de Drizzle em tabelas adicionadas dinamicamente
    const sql = postgres(process.env.NEON_DATABASE_URL || "", { prepare: false, max: 1 });
    try {
      await sql`
        INSERT INTO course_waitlist ("courseId", "userId", email)
        VALUES (${courseId}, ${userId}, ${email})
        ON CONFLICT ("courseId", email) DO NOTHING
      `;
    } finally {
      await sql.end({ timeout: 3 });
    }

    return NextResponse.json({ success: true, message: "Você será avisado assim que o conteúdo for publicado!" });
  } catch (error) {
    console.error("Erro ao cadastrar na lista de espera:", error);
    return NextResponse.json({ error: "Não foi possível registrar o aviso no momento." }, { status: 500 });
  }
}
