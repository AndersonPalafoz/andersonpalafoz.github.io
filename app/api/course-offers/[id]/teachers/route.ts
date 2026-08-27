import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { courseOfferTeacherAssignments, courseOffers, users } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { canManageCourseOffer, canReadCourseOffer, requireTeacherOrAdmin } from "@/lib/admin-auth";

type RouteContext = { params: Promise<{ id: string }> };
const GLOBAL_ROLES = new Set(["admin", "super_admin"]);

async function getContext(context: RouteContext) {
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
  const offerId = await getContext(context);
  if (!offerId) return NextResponse.json({ error: "ID de oferta inválido." }, { status: 400 });
  if (!await canReadCourseOffer(session, offerId)) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const assignments = await db.query.courseOfferTeacherAssignments.findMany({
    where: eq(courseOfferTeacherAssignments.offerId, offerId),
    with: { teacher: true },
  });
  return NextResponse.json({ assignments });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await requireTeacherOrAdmin();
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
  const offerId = await getContext(context);
  if (!offerId) return NextResponse.json({ error: "ID de oferta inválido." }, { status: 400 });
  const user = await currentUser(session);
  if (!user || !GLOBAL_ROLES.has(user.role)) return NextResponse.json({ error: "Somente administradores podem atribuir professores." }, { status: 403 });
  if (!await canManageCourseOffer(session, offerId)) return NextResponse.json({ error: "Oferta não encontrada ou inacessível." }, { status: 404 });
  const offer = await db.query.courseOffers.findFirst({ where: eq(courseOffers.id, offerId) });
  if (!offer || offer.deletedAt) return NextResponse.json({ error: "Oferta não encontrada." }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const teacherId = Number(body.teacherId);
  if (!Number.isInteger(teacherId) || teacherId <= 0) return NextResponse.json({ error: "teacherId inválido." }, { status: 400 });
  const teacher = await db.query.users.findFirst({ where: eq(users.id, teacherId) });
  if (!teacher || teacher.role !== "professor") return NextResponse.json({ error: "O usuário informado não é professor." }, { status: 400 });
  const [assignment] = await db.insert(courseOfferTeacherAssignments).values({ offerId, teacherId, assignedBy: user.id }).onConflictDoNothing().returning();
  if (!assignment) return NextResponse.json({ error: "Professor já está atribuído a esta oferta." }, { status: 409 });
  return NextResponse.json({ assignment }, { status: 201 });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await requireTeacherOrAdmin();
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
  const offerId = await getContext(context);
  if (!offerId) return NextResponse.json({ error: "ID de oferta inválido." }, { status: 400 });
  const user = await currentUser(session);
  if (!user || !GLOBAL_ROLES.has(user.role)) return NextResponse.json({ error: "Somente administradores podem remover professores." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const teacherId = Number(body.teacherId);
  if (!Number.isInteger(teacherId) || teacherId <= 0) return NextResponse.json({ error: "teacherId inválido." }, { status: 400 });
  const [removed] = await db.delete(courseOfferTeacherAssignments)
    .where(and(eq(courseOfferTeacherAssignments.offerId, offerId), eq(courseOfferTeacherAssignments.teacherId, teacherId)))
    .returning();
  if (!removed) return NextResponse.json({ error: "Atribuição não encontrada." }, { status: 404 });
  return NextResponse.json({ assignment: removed });
}
