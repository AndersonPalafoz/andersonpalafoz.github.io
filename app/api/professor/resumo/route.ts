import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, getUserByEmail } from "@/lib/db";
import { materialComments, materials, users, externalClasses, externalClassGrades, courses } from "@/drizzle/schema";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    const user = await getUserByEmail(session.user.email);
    if (!user || (user.role !== "admin" && user.role !== "professor")) return NextResponse.json({ error: "Acesso restrito a professores" }, { status: 403 });

    const [courseRows, allComments] = await Promise.all([
      db.select({ id: courses.id, instructor: courses.instructor }).from(courses),
      db.select({ id: materialComments.id, content: materialComments.content, createdAt: materialComments.createdAt, materialId: materialComments.materialId, materialTitle: materials.title, materialCourseId: materials.courseId, student: { id: users.id, name: users.name, email: users.email, avatarUrl: users.avatarUrl } })
        .from(materialComments)
        .innerJoin(materials, eq(materialComments.materialId, materials.id))
        .innerJoin(users, eq(materialComments.userId, users.id))
        .where(sql`${materialComments.parentId} IS NULL`)
        .orderBy(desc(materialComments.createdAt))
        .limit(100),
    ]);
    const visibleCourseIds = new Set((user.role === "admin" ? courseRows : courseRows.filter((course) => course.instructor === "Anderson Palafoz" || course.instructor === user.name)).map((course) => course.id));
    const pendingQuestions = allComments.filter((comment) => (user.role === "admin" || (comment.materialCourseId !== null && visibleCourseIds.has(comment.materialCourseId))) && comment.student.email !== session.user?.email).slice(0, 30);

    const classes = user.role === "admin" ? await db.select().from(externalClasses) : await db.select().from(externalClasses).where(eq(externalClasses.teacherId, user.id));
    const classAverages = await Promise.all(classes.map(async (classItem) => {
      const grades = await db.select({ score: externalClassGrades.score }).from(externalClassGrades).where(eq(externalClassGrades.externalClassId, classItem.id));
      const numericScores = grades.map((grade) => Number(grade.score)).filter((score) => Number.isFinite(score));
      return { id: classItem.id, name: classItem.className, institution: classItem.institution, averageScore: numericScores.length ? Number((numericScores.reduce((sum, score) => sum + score, 0) / numericScores.length).toFixed(2)) : null, gradesCount: numericScores.length };
    }));
    return NextResponse.json({ pendingQuestions, classAverages });
  } catch (error) { console.error("Erro ao carregar resumo do professor:", error); return NextResponse.json({ error: "Falha ao carregar resumo do professor" }, { status: 500 }); }
}
