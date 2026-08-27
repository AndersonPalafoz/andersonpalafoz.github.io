import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { coupons } from "@/drizzle/schema";
import { getStripe } from "@/lib/stripe";
import { requireSuperAdminUser } from "@/lib/superadmin-user";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireSuperAdminUser();
    if (!user) return NextResponse.json({ error: "Acesso restrito ao superadministrador." }, { status: 403 });
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
