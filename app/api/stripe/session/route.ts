import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { courses, enrollments, users } from "@/drizzle/schema";
import { getStripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    const sessionId = new URL(request.url).searchParams.get("session_id");
    if (!sessionId) return NextResponse.json({ error: "Sessão de pagamento ausente." }, { status: 400 });

    const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    const stripeSession = await getStripe().checkout.sessions.retrieve(sessionId);
    if (stripeSession.metadata?.user_id !== String(user.id)) return NextResponse.json({ error: "Sessão não pertence a este usuário." }, { status: 403 });

    const courseId = Number(stripeSession.metadata?.course_id);
    const course = Number.isInteger(courseId) ? await db.query.courses.findFirst({ where: eq(courses.id, courseId) }) : null;
    const enrollment = course ? await db.query.enrollments.findFirst({ where: and(eq(enrollments.courseId, course.id), eq(enrollments.userId, user.id)) }) : null;
    return NextResponse.json({
      session: { id: stripeSession.id, paymentStatus: stripeSession.payment_status, status: stripeSession.status, amountTotal: stripeSession.amount_total, currency: stripeSession.currency },
      course,
      enrollment: enrollment ? { id: enrollment.id, courseId: enrollment.courseId, status: enrollment.status } : null,
    });
  } catch (error) {
    console.error("Stripe session error:", error);
    return NextResponse.json({ error: "Não foi possível consultar o pagamento." }, { status: 500 });
  }
}
