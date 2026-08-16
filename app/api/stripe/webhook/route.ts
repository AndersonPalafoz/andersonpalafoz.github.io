import { NextResponse } from "next/server";
import Stripe from "stripe";
import { fulfillCoursePurchase } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) return NextResponse.json({ error: "Webhook Stripe não configurado." }, { status: 400 });

  try {
    const body = await request.text();
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.id.startsWith("evt_test_")) {
      console.log("[Stripe Webhook] Test event detected, returning verification response");
      return NextResponse.json({ verified: true });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = Number(session.metadata?.user_id || session.client_reference_id);
      const courseId = Number(session.metadata?.course_id);
      if (session.payment_status === "paid" && Number.isInteger(userId) && Number.isInteger(courseId)) {
        await fulfillCoursePurchase({
          userId,
          courseId,
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
          stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.id,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] verification or processing failed", error);
    return NextResponse.json({ error: "Webhook inválido." }, { status: 400 });
  }
}
