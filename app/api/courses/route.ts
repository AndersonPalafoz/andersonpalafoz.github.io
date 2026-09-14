import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { courses } from "@/drizzle/schema";
import { isLearnerVisibleCourse } from "@/lib/course-visibility";
import { requireTeacherOrAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const session = await requireTeacherOrAdmin();
  if (!session) return NextResponse.json({ error: "Acesso restrito a professores e administradores." }, { status: 403 });
  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const level = typeof body.level === "string" ? body.level.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    if (title.length < 3 || title.length > 255) return NextResponse.json({ error: "Informe um título de curso entre 3 e 255 caracteres." }, { status: 400 });
    if (!level || level.length > 50) return NextResponse.json({ error: "Informe o nível do curso." }, { status: 400 });
    const course = await db.insert(courses).values({ title, level, description: description || null, category: category || null, instructor: session.user.name || session.user.email || "Anderson Palafoz", isFree: true, price: "0" }).returning({ id: courses.id, title: courses.title, level: courses.level });
    return NextResponse.json({ course: course[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json({ error: "Não foi possível criar o curso." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const courseList = await db.select().from(courses).limit(100);
    return NextResponse.json(courseList.filter(isLearnerVisibleCourse));
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
