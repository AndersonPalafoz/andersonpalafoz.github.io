import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { courseOfferStudents, externalStudents, users } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { canManageCourseOffer, requireTeacherOrAdmin } from "@/lib/admin-auth";

type RouteContext = { params: Promise<{ id: string }> };

async function getOfferId(context: RouteContext) {
  const { id } = await context.params;
  const offerId = Number(id);
  return Number.isInteger(offerId) && offerId > 0 ? offerId : null;
}

async function currentUser(session: Awaited<ReturnType<typeof requireTeacherOrAdmin>>) {
  const email = session?.user.email?.toLowerCase();
  return email ? db.query.users.findFirst({ where: eq(users.email, email) }) : undefined;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await requireTeacherOrAdmin();
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
  const offerId = await getOfferId(context);
  if (!offerId) return NextResponse.json({ error: "ID de oferta inválido." }, { status: 400 });
  if (!await canManageCourseOffer(session, offerId)) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const students = await db.query.courseOfferStudents.findMany({ where: eq(courseOfferStudents.offerId, offerId) });
  return NextResponse.json({ students });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await requireTeacherOrAdmin();
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
  const offerId = await getOfferId(context);
  if (!offerId) return NextResponse.json({ error: "ID de oferta inválido." }, { status: 400 });
  if (!await canManageCourseOffer(session, offerId)) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const userId = body.userId ? Number(body.userId) : null;
  const externalStudentId = body.externalStudentId ? Number(body.externalStudentId) : null;
  if ((!userId || !Number.isInteger(userId)) && (!externalStudentId || !Number.isInteger(externalStudentId))) {
    return NextResponse.json({ error: "Informe userId ou externalStudentId." }, { status: 400 });
  }

  const linkedUser = userId ? await db.query.users.findFirst({ where: eq(users.id, userId) }) : undefined;
  const linkedExternalStudent = externalStudentId ? await db.query.externalStudents.findFirst({ where: eq(externalStudents.id, externalStudentId) }) : undefined;
  if (userId && !linkedUser) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  if (externalStudentId && !linkedExternalStudent) return NextResponse.json({ error: "Aluno externo não encontrado." }, { status: 404 });
  const name = String(body.name ?? linkedExternalStudent?.name ?? linkedUser?.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "O nome do aluno é obrigatório." }, { status: 400 });
  const [student] = await db.insert(courseOfferStudents).values({
    offerId,
    userId,
    externalStudentId,
    name,
    socialName: body.socialName ? String(body.socialName).trim() : linkedExternalStudent?.socialName ?? null,
    email: body.email ? String(body.email).trim() : linkedExternalStudent?.email ?? linkedUser?.email ?? null,
    studentIdNumber: body.studentIdNumber ? String(body.studentIdNumber).trim() : linkedExternalStudent?.studentIdNumber ?? null,
    status: body.status ? String(body.status) : "active",
    notes: body.notes ? String(body.notes).trim() : null,
  }).onConflictDoNothing().returning();
  if (!student) return NextResponse.json({ error: "Aluno já está matriculado nesta oferta." }, { status: 409 });
  return NextResponse.json({ student }, { status: 201 });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await requireTeacherOrAdmin();
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
  const offerId = await getOfferId(context);
  if (!offerId) return NextResponse.json({ error: "ID de oferta inválido." }, { status: 400 });
  if (!await canManageCourseOffer(session, offerId)) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const studentId = Number(body.studentId);
  if (!Number.isInteger(studentId) || studentId <= 0) return NextResponse.json({ error: "studentId inválido." }, { status: 400 });
  const payload = Object.fromEntries(Object.entries(body).filter(([key]) => ["status", "notes", "name", "socialName", "email", "studentIdNumber"].includes(key)));
  const [student] = await db.update(courseOfferStudents).set({ ...payload, updatedAt: new Date() }).where(eq(courseOfferStudents.id, studentId)).returning();
  if (!student || student.offerId !== offerId) return NextResponse.json({ error: "Matrícula não encontrada." }, { status: 404 });
  return NextResponse.json({ student });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await requireTeacherOrAdmin();
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
  const offerId = await getOfferId(context);
  if (!offerId) return NextResponse.json({ error: "ID de oferta inválido." }, { status: 400 });
  if (!await canManageCourseOffer(session, offerId)) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const studentId = Number(body.studentId);
  if (!Number.isInteger(studentId) || studentId <= 0) return NextResponse.json({ error: "studentId inválido." }, { status: 400 });
  const [student] = await db.delete(courseOfferStudents).where(eq(courseOfferStudents.id, studentId)).returning();
  if (!student || student.offerId !== offerId) return NextResponse.json({ error: "Matrícula não encontrada." }, { status: 404 });
  return NextResponse.json({ student });
}
