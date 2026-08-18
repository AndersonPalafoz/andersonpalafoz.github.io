import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, ilike } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { coupons, users } from "@/drizzle/schema";
import { getStripe } from "@/lib/stripe";

const SUPER_ADMIN_EMAIL = "palafozanderson@gmail.com";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email || (email !== SUPER_ADMIN_EMAIL && session?.user?.role !== "admin")) return null;
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  return user || null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    const params = request.nextUrl.searchParams;
    const search = params.get("search")?.trim().slice(0, 64) || "";
    const status = params.get("status") || "all";
    const pageSizeValue = Number(params.get("pageSize") || 20);
    const pageValue = Number(params.get("page") || 1);
    const pageSize = Number.isInteger(pageSizeValue) ? Math.min(Math.max(pageSizeValue, 1), 50) : 20;
    const page = Number.isInteger(pageValue) ? Math.max(pageValue, 1) : 1;
    if (!["all", "active", "inactive"].includes(status)) return NextResponse.json({ error: "Status de cupom inválido." }, { status: 400 });
    const filters = [
      ...(search ? [ilike(coupons.code, `%${search}%`)] : []),
      ...(status === "all" ? [] : [eq(coupons.active, status === "active")]),
    ];
    const items = await db.select().from(coupons).where(filters.length ? and(...filters) : undefined).orderBy(desc(coupons.createdAt)).limit(pageSize).offset((page - 1) * pageSize);
    return NextResponse.json({ coupons: items, pagination: { page, pageSize, hasMore: items.length === pageSize }, filters: { search, status } });
  } catch (error) {
    console.error("Erro ao carregar cupons:", error);
    return NextResponse.json({ error: "Não foi possível carregar os cupons." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });

    const body = await request.json();
    const code = String(body.code || "").trim().toUpperCase();
    const percentOff = body.percentOff === "" || body.percentOff == null ? null : Number(body.percentOff);
    const amountOff = body.amountOff === "" || body.amountOff == null ? null : Number(body.amountOff);
    const maxRedemptions = body.maxRedemptions === "" || body.maxRedemptions == null ? null : Number(body.maxRedemptions);
    const redeemBy = body.redeemBy ? new Date(String(body.redeemBy)) : null;

    if (!/^[A-Z0-9_-]{3,64}$/.test(code)) return NextResponse.json({ error: "Use um código com 3 a 64 caracteres alfanuméricos, hífen ou sublinhado." }, { status: 400 });
    if ((percentOff == null) === (amountOff == null)) return NextResponse.json({ error: "Informe percentual ou valor fixo, mas não os dois." }, { status: 400 });
    if (percentOff != null && (!Number.isFinite(percentOff) || percentOff <= 0 || percentOff > 100)) return NextResponse.json({ error: "O percentual deve estar entre 0,01 e 100." }, { status: 400 });
    if (amountOff != null && (!Number.isFinite(amountOff) || amountOff < 50)) return NextResponse.json({ error: "O valor fixo deve ser informado em centavos e ter no mínimo 50 centavos." }, { status: 400 });
    if (maxRedemptions != null && (!Number.isInteger(maxRedemptions) || maxRedemptions < 1)) return NextResponse.json({ error: "O limite de resgates deve ser um inteiro positivo." }, { status: 400 });
    if (redeemBy && (!Number.isFinite(redeemBy.getTime()) || redeemBy.getTime() <= Date.now())) return NextResponse.json({ error: "A data de expiração deve estar no futuro." }, { status: 400 });

    const existing = await db.query.coupons.findFirst({ where: eq(coupons.code, code) });
    if (existing) return NextResponse.json({ error: "Já existe um cupom com esse código." }, { status: 409 });

    const stripe = getStripe();
    const stripeCoupon = await stripe.coupons.create({
      id: code,
      duration: "once",
      percent_off: percentOff ?? undefined,
      amount_off: amountOff ?? undefined,
      currency: amountOff != null ? "brl" : undefined,
      max_redemptions: maxRedemptions ?? undefined,
      redeem_by: redeemBy ? Math.floor(redeemBy.getTime() / 1000) : undefined,
      metadata: { created_by: String(user.id), code },
    });

    const [created] = await db.insert(coupons).values({
      code,
      stripeCouponId: stripeCoupon.id,
      percentOff: percentOff == null ? null : String(percentOff),
      amountOff: amountOff == null ? null : String(amountOff),
      currency: "brl",
      maxRedemptions,
      redeemBy,
      active: true,
      createdBy: user.id,
    }).returning();

    return NextResponse.json({ coupon: created }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cupom:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível criar o cupom." }, { status: 500 });
  }
}
