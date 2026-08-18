import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  externalStudents,
  externalClasses,
  externalClassGrades,
  externalClassMaterials,
  externalClassAttendance,
} from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Sessão não encontrada." }, { status: 401 });
    }

    const email = session.user.email.toLowerCase().trim();

    // Buscar registros de aluno externo com este e-mail
    const studentRecords = await db.select().from(externalStudents).where(eq(externalStudents.email, email));

    const enrollments = [];
    for (const st of studentRecords) {
      const cls = await db.query.externalClasses.findFirst({
        where: eq(externalClasses.id, st.externalClassId),
      });
      if (!cls) continue;

      const grades = await db.select().from(externalClassGrades).where(eq(externalClassGrades.studentId, st.id));
      const materials = await db.select().from(externalClassMaterials).where(eq(externalClassMaterials.externalClassId, cls.id));
      const attendanceRows = await db.select().from(externalClassAttendance).where(eq(externalClassAttendance.externalClassId, cls.id));

      // Calcular frequência do aluno
      let totalClasses = attendanceRows.length;
      let presentCount = 0;
      attendanceRows.forEach(att => {
        try {
          const parsed = JSON.parse(att.attendanceData);
          if (parsed[st.id] === "present" || parsed[st.id] === "late") {
            presentCount++;
          }
        } catch {
          // ignora falha de parse
        }
      });

      const attendanceRate = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : null;

      enrollments.push({
        student: st,
        classItem: cls,
        grades,
        materials,
        attendanceStats: {
          totalClasses,
          presentCount,
          attendanceRate,
        },
      });
    }

    return NextResponse.json({ success: true, enrollments });
  } catch (error) {
    console.error("Erro ao carregar portal do aluno:", error);
    return NextResponse.json({ error: "Erro interno ao carregar dados do aluno." }, { status: 500 });
  }
}
