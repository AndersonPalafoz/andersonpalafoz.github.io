import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, courses, enrollments, progress } from "@/drizzle/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [userRows, courseRows, enrollmentRows, progressRows] = await Promise.all([
      db.select().from(users),
      db.select().from(courses),
      db.select().from(enrollments).orderBy(desc(enrollments.enrolledAt)),
      db.select().from(progress).orderBy(desc(progress.updatedAt)),
    ]);

    const activeUsers = userRows.filter((user) => !user.deletedAt);
    const students = activeUsers.filter((user) => user.role === "user");
    const teachers = activeUsers.filter((user) => user.role === "professor");
    const studentReports = students.map((student) => {
      const studentEnrollments = enrollmentRows.filter((enrollment) => enrollment.userId === student.id);
      const studentProgress = progressRows.filter((row) => row.userId === student.id);
      const averageProgress = studentEnrollments.length ? Math.round(studentEnrollments.reduce((sum, row) => sum + (row.progress || 0), 0) / studentEnrollments.length) : 0;
      return {
        id: student.id,
        name: student.name || student.email || `Aluno #${student.id}`,
        email: student.email,
        teacherId: student.teacherId,
        enrollments: studentEnrollments.length,
        completed: studentEnrollments.filter((row) => row.progress === 100).length,
        averageProgress,
        lastActivity: studentProgress[0]?.updatedAt || student.lastSignedIn,
      };
    }).sort((a, b) => b.averageProgress - a.averageProgress);

    const teacherReports = teachers.map((teacher) => {
      const assignedStudents = students.filter((student) => student.teacherId === teacher.id);
      const teacherStudentIds = new Set(assignedStudents.map((student) => student.id));
      const teacherEnrollments = enrollmentRows.filter((enrollment) => teacherStudentIds.has(enrollment.userId));
      return {
        id: teacher.id,
        name: teacher.name || teacher.email || `Professor #${teacher.id}`,
        email: teacher.email,
        students: assignedStudents.length,
        enrollments: teacherEnrollments.length,
        averageProgress: teacherEnrollments.length ? Math.round(teacherEnrollments.reduce((sum, row) => sum + (row.progress || 0), 0) / teacherEnrollments.length) : 0,
      };
    }).sort((a, b) => b.students - a.students);

    const courseReports = courseRows.filter((course) => !course.deletedAt).map((course) => {
      const courseEnrollments = enrollmentRows.filter((enrollment) => enrollment.courseId === course.id);
      return {
        id: course.id,
        title: course.title,
        level: course.level,
        enrollments: courseEnrollments.length,
        completed: courseEnrollments.filter((row) => row.progress === 100).length,
        averageProgress: courseEnrollments.length ? Math.round(courseEnrollments.reduce((sum, row) => sum + (row.progress || 0), 0) / courseEnrollments.length) : 0,
      };
    }).sort((a, b) => b.enrollments - a.enrollments);

    return NextResponse.json({ studentReports, teacherReports, courseReports, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Error fetching detailed academic reports:", error);
    return NextResponse.json({ error: "Não foi possível carregar os relatórios detalhados." }, { status: 500 });
  }
}
