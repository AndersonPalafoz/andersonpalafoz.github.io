import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";
import { users, enrollments, lessonProgress } from "@/drizzle/schema";
import { eq, isNull, and } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get("id");
    if (!studentIdParam) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    const studentId = parseInt(studentIdParam, 10);

    const student = await db.query.users.findFirst({
      where: and(eq(users.id, studentId), isNull(users.deletedAt)),
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const [studentEnrollments, studentProgress] = await Promise.all([
      db.select().from(enrollments).where(eq(enrollments.userId, studentId)),
      db.select().from(lessonProgress).where(eq(lessonProgress.userId, studentId)),
    ]);

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: student.name || student.email,
        email: student.email,
        role: student.role,
        lastSignedIn: student.lastSignedIn,
        enrolledCourses: studentEnrollments,
        completedLessonsCount: studentProgress.filter((p: any) => p.completed).length,
        totalProgressRecords: studentProgress.length,
        provenance: "Plataforma Local / Sincronização Neon",
      },
    });
  } catch (error) {
    console.error("Error fetching student individual details:", error);
    return NextResponse.json({ error: "Failed to fetch student details" }, { status: 500 });
  }
}
