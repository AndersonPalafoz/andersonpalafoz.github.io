import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db, getCoursePurchases } from "@/lib/db";
import { enrollments, users } from "@/drizzle/schema";
import { getStripe } from "@/lib/stripe";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

    const purchases = await getCoursePurchases(user.id);
    const stripe = getStripe();
    const items = await Promise.all(purchases.map(async ({ purchase, course }) => {
      let payment: { amountTotal: number | null; currency: string | null; paymentStatus: string | null; receiptUrl?: string | null } = { amountTotal: null, currency: null, paymentStatus: null };
      try {
        const checkout = await stripe.checkout.sessions.retrieve(purchase.stripeCheckoutSessionId, { expand: ["payment_intent.latest_charge"] });
        const paymentIntent = typeof checkout.payment_intent === "object" && checkout.payment_intent ? checkout.payment_intent : null;
        const charge = paymentIntent && typeof paymentIntent.latest_charge === "object" && paymentIntent.latest_charge ? paymentIntent.latest_charge : null;
        payment = { amountTotal: checkout.amount_total, currency: checkout.currency, paymentStatus: checkout.payment_status, receiptUrl: charge?.receipt_url || null };
      } catch (error) {
        console.warn("Não foi possível consultar a sessão Stripe", purchase.stripeCheckoutSessionId, error);
      }
      const enrollment = await db.query.enrollments.findFirst({ where: and(eq(enrollments.userId, user.id), eq(enrollments.courseId, course.id)) });
      return { id: purchase.id, purchasedAt: purchase.createdAt, checkoutSessionId: purchase.stripeCheckoutSessionId, course, payment, progress: enrollment?.progress ?? 0 };
    }));
    return NextResponse.json({ purchases: items });
  } catch (error) {
    console.error("Purchases history error:", error);
    return NextResponse.json({ error: "Não foi possível carregar o histórico de compras." }, { status: 500 });
  }
}
