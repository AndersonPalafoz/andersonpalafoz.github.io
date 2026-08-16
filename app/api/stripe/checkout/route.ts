import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { courses, enrollments, users } from "@/drizzle/schema";
import { ensureCoursePrice, getStripe, getStripeOrigin } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Faça login para comprar um curso." }, { status: 401 });
    const { courseId } = await request.json();
    const parsedCourseId = Number(courseId);
    if (!Number.isInteger(parsedCourseId) || parsedCourseId <= 0) return NextResponse.json({ error: "Curso inválido." }, { status: 400 });

    const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
    const course = await db.query.courses.findFirst({ where: eq(courses.id, parsedCourseId) });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    if (!course) return NextResponse.json({ error: "Curso não encontrado." }, { status: 404 });
    if (course.isFree) return NextResponse.json({ error: "Este curso é gratuito. Use a matrícula gratuita." }, { status: 400 });

    const existingEnrollment = await db.query.enrollments.findFirst({ where: and(eq(enrollments.userId, user.id), eq(enrollments.courseId, course.id)) });
    if (existingEnrollment) return NextResponse.json({ enrolled: true, courseId: course.id, message: "Você já tem acesso a este curso." }, { status: 409 });

    const stripe = getStripe();
    const priceId = await ensureCoursePrice(course);
    const origin = getStripeOrigin(request);
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email || undefined,
      client_reference_id: String(user.id),
      allow_promotion_codes: true,
      metadata: { user_id: String(user.id), course_id: String(course.id), customer_email: user.email || "", customer_name: user.name || "" },
      success_url: `${origin}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cursos/${course.id}?checkout=cancelled`,
    });

    return NextResponse.json({ checkoutUrl: checkout.url, sessionId: checkout.id });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível iniciar o pagamento." }, { status: 500 });
  }
}
