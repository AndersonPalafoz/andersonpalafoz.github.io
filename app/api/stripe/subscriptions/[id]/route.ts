import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { getStripe } from "@/lib/stripe";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
    if (!user?.stripeCustomerId) return NextResponse.json({ error: "Nenhuma conta Stripe vinculada." }, { status: 404 });
    const subscriptionId = (await context.params).id;
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (subscription.customer !== user.stripeCustomerId) return NextResponse.json({ error: "Assinatura não pertence ao usuário autenticado." }, { status: 403 });
    const updated = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
    return NextResponse.json({ subscription: { id: updated.id, status: updated.status, cancelAtPeriodEnd: updated.cancel_at_period_end } });
  } catch (error) { console.error("Subscription cancellation error:", error); return NextResponse.json({ error: "Não foi possível atualizar a assinatura." }, { status: 500 }); }
}
