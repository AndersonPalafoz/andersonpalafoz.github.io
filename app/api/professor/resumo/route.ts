import { NextResponse } from "next/server";
import { eq, desc, sql } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, getUserByEmail } from "@/lib/db";
import { materialComments, materials, users, externalClasses, externalClassGrades } from "@/drizzle/schema";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const user = await getUserByEmail(session.user.email);
    if (!user || (user.role !== "admin" && user.role !== "professor")) {
      return NextResponse.json({ error: "Acesso restrito a professores" }, { status: 403 });
    }

    // 1. Dúvidas pendentes nos materiais
    const allComments = await db
      .select({
        id: materialComments.id,
        content: materialComments.content,
        createdAt: materialComments.createdAt,
        materialId: materialComments.materialId,
        materialTitle: materials.title,
        student: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(materialComments)
      .innerJoin(materials, eq(materialComments.materialId, materials.id))
      .innerJoin(users, eq(materialComments.userId, users.id))
      .where(sql`${materialComments.parentId} IS NULL`)
      .orderBy(desc(materialComments.createdAt))
      .limit(30);

    const pendingQuestions = allComments.filter((c) => c.student.email !== session.user?.email);

    // 2. Médias reais de notas por turma externa
    const classes = user.role === "admin"
      ? await db.select().from(externalClasses)
      : await db.select().from(externalClasses).where(eq(externalClasses.teacherId, user.id));

    const classAverages = [];
    for (const c of classes) {
      const grades = await db
        .select({ score: externalClassGrades.score })
        .from(externalClassGrades)
        .where(eq(externalClassGrades.externalClassId, c.id));

      const numericScores = grades.map((g) => parseFloat(g.score)).filter((s) => !isNaN(s));
      const avg = numericScores.length > 0 ? numericScores.reduce((a, b) => a + b, 0) / numericScores.length : 0;

      classAverages.push({
        id: c.id,
        name: c.className,
        institution: c.institution,
        averageScore: Number(avg.toFixed(2)),
        gradesCount: numericScores.length,
      });
    }

    return NextResponse.json({
      pendingQuestions,
      classAverages,
    });
  } catch (error) {
    console.error("Error fetching professor summary:", error);
    return NextResponse.json({ error: "Falha ao carregar resumo do professor" }, { status: 500 });
  }
}
