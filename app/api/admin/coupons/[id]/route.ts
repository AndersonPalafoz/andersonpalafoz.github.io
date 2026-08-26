import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { coupons, users } from "@/drizzle/schema";
import { getStripe } from "@/lib/stripe";

const SUPER_ADMIN_EMAIL = "palafozanderson@gmail.com";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (email !== SUPER_ADMIN_EMAIL) return null;
  return db.query.users.findFirst({ where: eq(users.email, email) });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    const id = Number((await context.params).id);
    if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Cupom inválido." }, { status: 400 });
    const coupon = await db.query.coupons.findFirst({ where: eq(coupons.id, id) });
    if (!coupon) return NextResponse.json({ error: "Cupom não encontrado." }, { status: 404 });
    if (!coupon.active) return NextResponse.json({ coupon, message: "O cupom já estava inativo." });

    await getStripe().coupons.del(coupon.stripeCouponId);
    const [updated] = await db.update(coupons).set({ active: false, updatedAt: new Date() }).where(eq(coupons.id, id)).returning();
    return NextResponse.json({ coupon: updated });
  } catch (error) {
    console.error("Erro ao desativar cupom:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível desativar o cupom." }, { status: 500 });
  }
}
