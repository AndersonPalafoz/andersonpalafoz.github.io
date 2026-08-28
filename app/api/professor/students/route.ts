import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { courseOfferStudents, externalStudents, users } from "@/drizzle/schema";
import { isTechnicalLearnerIdentity } from "@/lib/technical-identities";
import { resolveAndAuthorizeAcademicContext } from "@/lib/academic-context";
import { type AdminAuthSession } from "@/lib/admin-auth";
import { and, eq } from "drizzle-orm";

async function authorizeTeacher() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const isAllowed = role === "professor" || role === "admin" || role === "super_admin";
  const isApproved = session?.user?.approvalStatus === "approved";
  return { session, isAllowed: isAllowed && isApproved };
}

function academicSession(session: Awaited<ReturnType<typeof authorizeTeacher>>["session"]): AdminAuthSession {
  return session as unknown as AdminAuthSession;
}

export async function GET(request: NextRequest) {
  try {
    const { session, isAllowed } = await authorizeTeacher();
    if (!isAllowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const offerId = request.nextUrl.searchParams.get("offerId");
    const classId = request.nextUrl.searchParams.get("classId");
    if (offerId || classId) {
      const access = await resolveAndAuthorizeAcademicContext(academicSession(session), { offerId, classId }, "manage");
      if (!access.allowed) return NextResponse.json({ error: "Acesso negado ao contexto acadêmico." }, { status: 403 });

      if (access.context.offerId) {
        const students = await db.query.courseOfferStudents.findMany({
          where: eq(courseOfferStudents.offerId, access.context.offerId),
          orderBy: (table, { asc }) => asc(table.name),
        });
        return NextResponse.json({ students, context: { offerId: access.context.offerId, classId: access.context.classId, courseId: access.context.courseId } });
      }

      const legacyStudents = await db.query.externalStudents.findMany({
        where: eq(externalStudents.externalClassId, access.context.classId!),
        orderBy: (table, { asc }) => asc(table.name),
      });
      return NextResponse.json({
        students: legacyStudents.map((student) => ({
          id: null,
          courseOfferStudentId: null,
          externalStudentId: student.id,
          userId: student.userId,
          name: student.name,
          socialName: student.socialName,
          email: student.email,
          studentIdNumber: student.studentIdNumber,
          status: student.status,
          notes: student.notes,
        })),
        context: { offerId: null, classId: access.context.classId, courseId: null },
      });
    }

    const pendingStudents = await db.query.users.findMany({
      where: and(eq(users.requestedRole, "student"), eq(users.approvalStatus, "pending")),
      columns: { id: true, name: true, email: true, requestedRole: true, approvalStatus: true, createdAt: true },
      orderBy: (table, { asc }) => asc(table.createdAt),
    });

    return NextResponse.json({
      students: pendingStudents.filter((student) => !isTechnicalLearnerIdentity(student)).map((student) => ({
        courseOfferStudentId: null,
        ...student,
      })),
      pendingRequests: true,
    });
  } catch (error) {
    console.error("Error listing professor students:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, isAllowed } = await authorizeTeacher();
    if (!isAllowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await request.json().catch(() => ({}));

    if (body.action === "approve" || body.action === "reject") {
      const userId = Number(body.userId);
      if (!Number.isInteger(userId) || userId <= 0) return NextResponse.json({ error: "userId and action are required" }, { status: 400 });
      const target = await db.query.users.findFirst({ where: eq(users.id, userId) });
      if (!target || target.requestedRole !== "student" || target.approvalStatus !== "pending") return NextResponse.json({ error: "Pending student request not found" }, { status: 404 });
      const approvalStatus: "approved" | "rejected" = body.action === "approve" ? "approved" : "rejected";
      const updateData: { approvalStatus: "approved" | "rejected"; updatedAt: Date; teacherId?: number } = { approvalStatus, updatedAt: new Date() };
      if (approvalStatus === "approved" && session?.user?.id) updateData.teacherId = Number(session.user.id);
      const [updated] = await db.update(users).set(updateData).where(and(eq(users.id, userId), eq(users.requestedRole, "student"))).returning({ id: users.id, approvalStatus: users.approvalStatus, teacherId: users.teacherId });
      return NextResponse.json({ user: updated, reviewedBy: session?.user?.email });
    }

    const access = await resolveAndAuthorizeAcademicContext(academicSession(session), { offerId: body.offerId, classId: body.classId }, "manage");
    if (!access.allowed || !access.context.offerId) return NextResponse.json({ error: "Uma oferta válida é necessária para matricular o aluno." }, { status: 400 });
    const courseOfferStudentId = Number(body.courseOfferStudentId ?? body.studentId);
    if (!Number.isInteger(courseOfferStudentId) || courseOfferStudentId <= 0) return NextResponse.json({ error: "courseOfferStudentId é obrigatório." }, { status: 400 });
    const [student] = await db.update(courseOfferStudents)
      .set({ status: body.status ? String(body.status) : undefined, notes: body.notes !== undefined ? String(body.notes) : undefined, updatedAt: new Date() })
      .where(and(eq(courseOfferStudents.id, courseOfferStudentId), eq(courseOfferStudents.offerId, access.context.offerId)))
      .returning();
    if (!student) return NextResponse.json({ error: "Aluno não encontrado nesta oferta." }, { status: 404 });
    return NextResponse.json({ student });
  } catch (error) {
    console.error("Error updating professor student:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
