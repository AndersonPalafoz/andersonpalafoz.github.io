import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { courses, type Course } from "@/drizzle/schema";

let stripeClient: Stripe | null = null;

export type StripeConfigurationErrorCode = "STRIPE_NOT_CONFIGURED" | "STRIPE_INVALID_KEY";

export class StripeConfigurationError extends Error {
  readonly code: StripeConfigurationErrorCode;
  readonly status = 503;

  constructor(code: StripeConfigurationErrorCode, message: string) {
    super(message);
    this.name = "StripeConfigurationError";
    this.code = code;
  }
}

function readStripeSecretKey() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new StripeConfigurationError(
      "STRIPE_NOT_CONFIGURED",
      "O pagamento online está temporariamente indisponível. O administrador precisa configurar o Stripe no ambiente de produção.",
    );
  }
  if (!/^sk_(test|live)_[A-Za-z0-9]+$/.test(secretKey)) {
    throw new StripeConfigurationError(
      "STRIPE_INVALID_KEY",
      "O pagamento online está temporariamente indisponível. A configuração do Stripe precisa ser revisada pelo administrador.",
    );
  }
  return secretKey;
}

export function getStripe() {
  if (!stripeClient) {
    try {
      stripeClient = new Stripe(readStripeSecretKey());
    } catch (error) {
      if (error instanceof StripeConfigurationError) throw error;
      throw new StripeConfigurationError(
        "STRIPE_INVALID_KEY",
        "O pagamento online está temporariamente indisponível. A configuração do Stripe precisa ser revisada pelo administrador.",
      );
    }
  }
  return stripeClient;
}

export function getStripeOrigin(request: Request) {
  return request.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";
}

export async function ensureCoursePrice(course: Course) {
  const stripe = getStripe();
  if (course.stripePriceId) return course.stripePriceId;
  const amountInCents = Math.round(Number(course.price || 0) * 100);
  if (!Number.isFinite(amountInCents) || amountInCents < 50) throw new Error("O preço do curso deve ser de pelo menos R$ 0,50.");

  const product = await stripe.products.create({
    name: course.title,
    description: course.description || `Curso de inglês ${course.level}`,
    metadata: { course_id: String(course.id), level: course.level },
  });
  const price = await stripe.prices.create({
    product: product.id,
    currency: "brl",
    unit_amount: amountInCents,
  });
  await db.update(courses).set({ stripeProductId: product.id, stripePriceId: price.id, updatedAt: new Date() }).where(eq(courses.id, course.id));
  return price.id;
}

export function isStripeConfigured() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim() || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim() || "";
  return /^sk_(test|live)_[A-Za-z0-9]+$/.test(secretKey) && webhookSecret.length > 0;
}
