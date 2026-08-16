import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { getStripe } from "@/lib/stripe";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    if (!user.stripeCustomerId) return NextResponse.json({ subscriptions: [] });
    const subscriptions = await getStripe().subscriptions.list({ customer: user.stripeCustomerId, status: "all", limit: 20 });
    return NextResponse.json({ subscriptions: subscriptions.data.map((subscription) => ({ id: subscription.id, status: subscription.status, cancelAtPeriodEnd: subscription.cancel_at_period_end, currentPeriodEnd: subscription.items.data[0]?.current_period_end ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString() : null, price: subscription.items.data[0]?.price?.unit_amount ?? null, currency: subscription.items.data[0]?.price?.currency ?? null })) });
  } catch (error) { console.error("Subscriptions history error:", error); return NextResponse.json({ error: "Não foi possível carregar assinaturas." }, { status: 500 }); }
}
