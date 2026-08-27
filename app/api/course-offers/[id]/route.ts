import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { users } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { canManageCourseOffer, canReadCourseOffer, requireTeacherOrAdmin } from "@/lib/admin-auth";
import { getCourseOfferById, restoreCourseOffer, softDeleteCourseOffer, updateCourseOffer } from "@/lib/course-offer-service";

const GLOBAL_ROLES = new Set(["admin", "super_admin"]);
type RouteContext = { params: Promise<{ id: string }> };

async function getOfferId(context: RouteContext) {
  const { id } = await context.params;
  const offerId = Number(id);
  return Number.isInteger(offerId) && offerId > 0 ? offerId : null;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await requireTeacherOrAdmin();
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
  const offerId = await getOfferId(context);
  if (!offerId) return NextResponse.json({ error: "ID de oferta inválido." }, { status: 400 });
  if (!await canReadCourseOffer(session, offerId)) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const offer = await getCourseOfferById(offerId);
  if (!offer || offer.deletedAt) return NextResponse.json({ error: "Oferta não encontrada." }, { status: 404 });
  return NextResponse.json({ offer });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await requireTeacherOrAdmin();
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
  const offerId = await getOfferId(context);
  if (!offerId) return NextResponse.json({ error: "ID de oferta inválido." }, { status: 400 });
  if (!await canManageCourseOffer(session, offerId)) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  try {
    const body = await request.json();
    const forbidden = ["id", "courseId", "ownerTeacherId", "sourceExternalClassId", "createdAt", "deletedAt"];
    const payload = Object.fromEntries(Object.entries(body).filter(([key]) => !forbidden.includes(key)));
    if (payload.offerName !== undefined && !String(payload.offerName).trim()) {
      return NextResponse.json({ error: "O nome da oferta não pode ficar vazio." }, { status: 400 });
    }
    if (payload.academicTerm !== undefined && !String(payload.academicTerm).trim()) {
      return NextResponse.json({ error: "O período acadêmico não pode ficar vazio." }, { status: 400 });
    }
    const offer = await updateCourseOffer(offerId, payload);
    if (!offer) return NextResponse.json({ error: "Oferta não encontrada." }, { status: 404 });
    return NextResponse.json({ offer });
  } catch (error) {
    console.error("Error updating course offer:", error);
    return NextResponse.json({ error: "Não foi possível atualizar a oferta." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await requireTeacherOrAdmin();
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
  const offerId = await getOfferId(context);
  if (!offerId) return NextResponse.json({ error: "ID de oferta inválido." }, { status: 400 });
  if (!await canManageCourseOffer(session, offerId)) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const offer = await softDeleteCourseOffer(offerId);
  if (!offer) return NextResponse.json({ error: "Oferta não encontrada ou já arquivada." }, { status: 404 });
  return NextResponse.json({ offer });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await requireTeacherOrAdmin();
  if (!session) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
  const offerId = await getOfferId(context);
  if (!offerId) return NextResponse.json({ error: "ID de oferta inválido." }, { status: 400 });
  const email = session.user.email?.toLowerCase();
  const user = email ? await db.query.users.findFirst({ where: eq(users.email, email) }) : undefined;
  if (!user || !GLOBAL_ROLES.has(user.role)) return NextResponse.json({ error: "Somente administradores podem restaurar ofertas." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  if (body.action !== "restore") return NextResponse.json({ error: "Ação inválida. Use restore." }, { status: 400 });
  const offer = await restoreCourseOffer(offerId);
  if (!offer) return NextResponse.json({ error: "Oferta não encontrada." }, { status: 404 });
  return NextResponse.json({ offer });
}
