import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { courses, type Course } from "@/drizzle/schema";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) throw new Error("Stripe não está configurado no servidor.");
    stripeClient = new Stripe(secretKey);
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
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}
