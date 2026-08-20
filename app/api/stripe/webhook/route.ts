import { NextResponse } from "next/server";
import Stripe from "stripe";
import { fulfillCoursePurchase } from "@/lib/db";
import { getStripe, StripeConfigurationError } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "O processamento automático do pagamento está temporariamente indisponível.", code: "STRIPE_WEBHOOK_NOT_CONFIGURED" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const body = await request.text();
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = Number(session.metadata?.user_id || session.client_reference_id);
      const courseId = Number(session.metadata?.course_id);
      if (session.payment_status === "paid") {
        if (!Number.isInteger(userId) || userId <= 0 || !Number.isInteger(courseId) || courseId <= 0) {
          console.error("[Stripe Webhook] completed session missing valid course metadata", { eventId: event.id, sessionId: session.id });
          return NextResponse.json({ error: "O pagamento foi recebido, mas os metadados da matrícula estão incompletos.", code: "STRIPE_METADATA_INVALID" }, { status: 422 });
        }
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
    if (error instanceof StripeConfigurationError) {
      return NextResponse.json({ error: "O processamento automático do pagamento está temporariamente indisponível.", code: error.code }, { status: error.status });
    }
    const message = error instanceof Stripe.errors.StripeSignatureVerificationError ? "A assinatura do webhook não foi validada." : "Webhook inválido.";
    const code = error instanceof Stripe.errors.StripeSignatureVerificationError ? "STRIPE_WEBHOOK_SIGNATURE_INVALID" : "STRIPE_WEBHOOK_PROCESSING_FAILED";
    console.error("[Stripe Webhook] verification or processing failed", { code, message });
    return NextResponse.json({ error: message, code }, { status: code === "STRIPE_WEBHOOK_SIGNATURE_INVALID" ? 400 : 502 });
  }
}
