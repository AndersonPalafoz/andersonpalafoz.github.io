import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
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
      let payment: { amountTotal: number | null; currency: string | null; paymentStatus: string | null; receiptUrl?: string | null } = { amountTotal: 15000, currency: "brl", paymentStatus: "paid" };
      try {
        if (purchase.stripeCheckoutSessionId && !purchase.stripeCheckoutSessionId.startsWith("mock_")) {
          const checkout = await stripe.checkout.sessions.retrieve(purchase.stripeCheckoutSessionId, { expand: ["payment_intent.latest_charge"] });
          const paymentIntent = typeof checkout.payment_intent === "object" && checkout.payment_intent ? checkout.payment_intent : null;
          const charge = paymentIntent && typeof paymentIntent.latest_charge === "object" && paymentIntent.latest_charge ? paymentIntent.latest_charge : null;
          payment = { amountTotal: checkout.amount_total ?? 15000, currency: checkout.currency ?? "brl", paymentStatus: checkout.payment_status ?? "paid", receiptUrl: charge?.receipt_url || null };
        }
      } catch (error) {
        console.warn("Sessão Stripe indisponível, usando dados locais de compra", purchase.stripeCheckoutSessionId, error);
      }
      const enrollment = await db.query.enrollments.findFirst({ where: and(eq(enrollments.userId, user.id), eq(enrollments.courseId, course.id)) });
      return { id: purchase.id, purchasedAt: purchase.createdAt, checkoutSessionId: purchase.stripeCheckoutSessionId, course, payment, progress: enrollment?.progress ?? 0 };
    }));
    return NextResponse.json({ purchases: items });
  } catch (error) {
    console.error("Purchases history error:", error);
    return NextResponse.json({ purchases: [] });
  }
}
