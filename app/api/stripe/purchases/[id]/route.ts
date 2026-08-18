import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db, getCoursePurchases } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const noStoreHeaders = { "Cache-Control": "no-store" };

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401, headers: noStoreHeaders });
    }

    const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404, headers: noStoreHeaders });
    }

    const { id } = await params;
    const purchases = await getCoursePurchases(user.id);
    const matched = purchases.find(({ purchase }) =>
      String(purchase.id) === id ||
      purchase.stripeCheckoutSessionId === id ||
      purchase.stripePaymentIntentId === id
    );

    if (!matched) {
      return NextResponse.json({ error: "Recibo não encontrado ou acesso não autorizado." }, { status: 404, headers: noStoreHeaders });
    }

    if (!matched.purchase.stripeCheckoutSessionId || matched.purchase.stripeCheckoutSessionId.startsWith("mock_")) {
      return NextResponse.json({ error: "Esta compra não possui uma sessão Stripe verificável." }, { status: 409, headers: noStoreHeaders });
    }

    const checkout = await getStripe().checkout.sessions.retrieve(matched.purchase.stripeCheckoutSessionId, {
      expand: ["payment_intent.latest_charge"],
    });
    if (checkout.metadata?.user_id !== String(user.id)) {
      return NextResponse.json({ error: "Recibo não encontrado ou acesso não autorizado." }, { status: 404, headers: noStoreHeaders });
    }
    if (checkout.payment_status !== "paid") {
      return NextResponse.json({ error: "O Stripe ainda não confirmou este pagamento." }, { status: 409, headers: noStoreHeaders });
    }
    const paymentIntent = typeof checkout.payment_intent === "object" && checkout.payment_intent ? checkout.payment_intent : null;
    const charge = paymentIntent && typeof paymentIntent.latest_charge === "object" && paymentIntent.latest_charge ? paymentIntent.latest_charge : null;

    return NextResponse.json({
      purchase: {
        id: matched.purchase.id,
        courseId: matched.purchase.courseId,
        amount: checkout.amount_total ?? null,
        currency: checkout.currency ?? null,
        paymentStatus: checkout.payment_status ?? null,
        checkoutStatus: checkout.status ?? null,
        createdAt: matched.purchase.createdAt,
        fulfilledAt: matched.purchase.fulfilledAt,
        stripeCheckoutSessionId: matched.purchase.stripeCheckoutSessionId,
        stripePaymentIntentId: matched.purchase.stripePaymentIntentId,
        receiptUrl: charge?.receipt_url || null,
      },
      course: matched.course,
    }, { headers: noStoreHeaders });
  } catch (error) {
    console.error("Protected payment receipt error:", error);
    return NextResponse.json({ error: "Não foi possível carregar o recibo da transação." }, { status: 500, headers: noStoreHeaders });
  }
}
