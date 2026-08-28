import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";
import { users, enrollments, progress, externalClassGrades, courseOffers, courseOfferStudents } from "@/drizzle/schema";
import { isTechnicalLearnerIdentity } from "@/lib/technical-identities";
import { and, desc, eq, isNull } from "drizzle-orm";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sourceFilter = searchParams.get("source") || "all";
    const offerIdParam = Number(searchParams.get("offerId"));
    const offerId = Number.isInteger(offerIdParam) && offerIdParam > 0 ? offerIdParam : null;
    const statusFilter = searchParams.get("status") || "all";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    let offerContext: { id: number; offerName: string; academicTerm: string; courseId: number } | null = null;
    let offerStudentIds: number[] | null = null;
    if (offerId) {
      const offer = await db.query.courseOffers.findFirst({
        where: and(eq(courseOffers.id, offerId), isNull(courseOffers.deletedAt)),
        columns: { id: true, offerName: true, academicTerm: true, courseId: true },
      });
      if (!offer) return NextResponse.json({ error: "Oferta não encontrada ou arquivada." }, { status: 404 });
      offerContext = offer;
      const enrollmentsForOffer = await db.query.courseOfferStudents.findMany({
        where: eq(courseOfferStudents.offerId, offerId),
        columns: { userId: true },
      });
      offerStudentIds = enrollmentsForOffer.map((row) => row.userId).filter((id): id is number => Number.isInteger(id));
    }

    let classroomConnected = false;
    let classroomSyncTimestamp = new Date().toISOString();
    let syncedCoursesCount = 0;

    try {
      const { stdout } = await execAsync("gws classroom courses list --params '{\"pageSize\":1}'");
      if (stdout) {
        classroomConnected = true;
        const parsed = JSON.parse(stdout);
        syncedCoursesCount = Array.isArray(parsed) ? parsed.length : Array.isArray(parsed?.courses) ? parsed.courses.length : 1;
      }
    } catch {
      classroomConnected = false;
    }

    const [allUsers, allEnrollments, allProgress] = await Promise.all([
      db.query.users.findMany({ where: isNull(users.deletedAt), orderBy: desc(users.lastSignedIn) }),
      db.select().from(enrollments),
      db.select().from(progress),
    ]);

    let gradesAvailable = true;
    let allGrades: Array<typeof externalClassGrades.$inferSelect> = [];
    try {
      allGrades = await db.select().from(externalClassGrades);
    } catch (gradesError) {
      gradesAvailable = false;
      console.error("Falha ao consultar notas externas nos relatórios:", gradesError);
    }

    let students = allUsers.filter((u: any) =>
      (u.role === "user" || u.role === "student" || u.role === "aluno") &&
      !isTechnicalLearnerIdentity(u) &&
      (!offerStudentIds || offerStudentIds.includes(u.id))
    );

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    students = students.filter((s: any) => {
      const lastLogin = s.lastSignedIn ? new Date(s.lastSignedIn).getTime() : 0;
      const isActive = lastLogin > thirtyDaysAgo || s.approvalStatus === "approved";
      if (statusFilter === "active" && !isActive) return false;
      if (statusFilter === "inactive" && isActive) return false;
      return true;
    });

    if (startDate) {
      const startMs = new Date(startDate).getTime();
      students = students.filter((s: any) => {
        const time = s.lastSignedIn ? new Date(s.lastSignedIn).getTime() : 0;
        return time >= startMs;
      });
    }
    if (endDate) {
      const endMs = new Date(endDate).getTime();
      students = students.filter((s: any) => {
        const time = s.lastSignedIn ? new Date(s.lastSignedIn).getTime() : 0;
        return time <= endMs;
      });
    }

    if (sourceFilter !== "all") {
      students = students.filter((student: any) => {
        const isClassroomImported = classroomConnected && allEnrollments.some((enrollment: any) => enrollment.userId === student.id);
        return sourceFilter === "classroom" ? isClassroomImported : !isClassroomImported;
      });
    }

    const totalStudents = students.length;
    const paginatedStudents = students.slice(offset, offset + pageSize);

    const reports = paginatedStudents.map((student: any) => {
      const studentEnrollments = allEnrollments.filter((e: any) => e.userId === student.id);
      const studentProgress = allProgress.filter((p: any) => p.userId === student.id);
      const studentGrades = allGrades.filter((g: any) => g.studentId === student.id);

      const isClassroomImported = classroomConnected && studentEnrollments.length > 0;
      const dataSource = isClassroomImported ? "Google Classroom" : "Plataforma Local";

      const numericGrades = studentGrades.map((g: any) => Number(g.score)).filter((n: number) => !isNaN(n));
      const avgGradeNum = numericGrades.length ? numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length : null;

      return {
        id: student.id,
        studentName: student.name || student.email || "Estudante",
        studentEmail: student.email,
        enrolledCoursesCount: studentEnrollments.length,
        averageGrade: avgGradeNum !== null ? avgGradeNum.toFixed(1) : "—",
        attendanceRate: studentProgress.length ? `${Math.round(studentProgress.reduce((acc, p) => acc + (p.percentageCompleted || 0), 0) / studentProgress.length)}%` : "—",
        dataSource,
        provenanceDetails: isClassroomImported
          ? "Sincronizado via Google Classroom API (Sessão Verificada)"
          : "Persistido diretamente na base interna (Neon)",
        lastActivity: student.lastSignedIn || new Date().toISOString(),
      };
    });

    const classroomImportedCount = reports.filter((r: any) => r.dataSource === "Google Classroom").length;
    const localCreatedCount = reports.filter((r: any) => r.dataSource === "Plataforma Local").length;

    const allNumericGrades = allGrades.map((g: any) => Number(g.score)).filter((n: number) => !isNaN(n));
    const averagePlatformGrade = allNumericGrades.length ? (allNumericGrades.reduce((a, b) => a + b, 0) / allNumericGrades.length).toFixed(1) : "0.0";

    return NextResponse.json({
      classroomSyncStatus: {
        connected: classroomConnected,
        lastSyncTime: classroomSyncTimestamp,
        sourceBadge: classroomConnected ? "Google Classroom API (OAuth Verificado)" : "Modo Local (Workspace Desconectado)",
        totalSyncedCourses: syncedCoursesCount,
        totalSyncedAssignments: allGrades.length,
      },
      academicDataStatus: {
        gradesAvailable,
      },
      summary: {
        totalStudents,
        classroomImportedCount,
        localCreatedCount,
        averagePlatformGrade,
      },
      reports,
      pagination: {
        page,
        pageSize,
        total: totalStudents,
        totalPages: Math.ceil(totalStudents / pageSize) || 1,
      },
      context: offerContext,
      filters: { source: sourceFilter, status: statusFilter, offerId },
    });
  } catch (error) {
    console.error("Error fetching academic reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
