import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { and, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { courses, enrollments, materials, users } from "@/drizzle/schema";
import { ensureCoursePrice, getStripe, getStripeOrigin } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Faça login para realizar a compra." }, { status: 401 });
    const body = await request.json();
    const courseId = body.courseId ? Number(body.courseId) : null;
    const materialId = body.materialId ? Number(body.materialId) : null;

    if (!courseId && !materialId) return NextResponse.json({ error: "Item de compra inválido." }, { status: 400 });

    const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

    const stripe = getStripe();
    const origin = getStripeOrigin(request);

    if (courseId) {
      const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
      if (!course) return NextResponse.json({ error: "Curso não encontrado." }, { status: 404 });
      if (course.isFree) return NextResponse.json({ error: "Este curso é gratuito." }, { status: 400 });

      const existingEnrollment = await db.query.enrollments.findFirst({ where: and(eq(enrollments.userId, user.id), eq(enrollments.courseId, course.id)) });
      if (existingEnrollment) return NextResponse.json({ enrolled: true, courseId: course.id, message: "Você já tem acesso a este curso." }, { status: 409 });

      const priceId = await ensureCoursePrice(course);
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
    }

    if (materialId) {
      const material = await db.query.materials.findFirst({ where: eq(materials.id, materialId) });
      if (!material) return NextResponse.json({ error: "Material não encontrado." }, { status: 404 });

      // Criar preço dinâmico no Stripe para o material (ex: R$ 49,90)
      const price = await stripe.prices.create({
        unit_amount: 4990,
        currency: "brl",
        product_data: { name: `Material Exclusivo: ${material.title}` },
      });

      const checkout = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: price.id, quantity: 1 }],
        customer_email: user.email || undefined,
        client_reference_id: String(user.id),
        allow_promotion_codes: true,
        metadata: { user_id: String(user.id), material_id: String(material.id), customer_email: user.email || "", customer_name: user.name || "" },
        success_url: `${origin}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/materiais/${material.id}?checkout=cancelled`,
      });

      return NextResponse.json({ checkoutUrl: checkout.url, sessionId: checkout.id });
    }

    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível iniciar o pagamento." }, { status: 500 });
  }
}
