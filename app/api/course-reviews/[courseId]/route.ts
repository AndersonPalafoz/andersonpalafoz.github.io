import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { courseReviews, enrollments } from "@/drizzle/schema";

function courseIdFrom(params: { courseId: string }) { const value = Number(params.courseId); return Number.isInteger(value) && value > 0 ? value : null; }
function userId(session: { user?: { id?: string | null } } | null) { const value = Number(session?.user?.id); return Number.isInteger(value) && value > 0 ? value : null; }

export async function GET(_request: Request, context: { params: Promise<{ courseId: string }> }) {
  const courseId = courseIdFrom(await context.params);
  if (!courseId) return NextResponse.json({ error: "Curso inválido." }, { status: 400 });
  const reviews = await db.query.courseReviews.findMany({ where: eq(courseReviews.courseId, courseId), with: { user: true }, orderBy: desc(courseReviews.createdAt) });
  const safeReviews = reviews.map((review) => ({ id: review.id, rating: review.rating, comment: review.comment, createdAt: review.createdAt, authorName: review.user?.name || "Aluno" }));
  const average = safeReviews.length ? Math.round((safeReviews.reduce((sum, review) => sum + review.rating, 0) / safeReviews.length) * 10) / 10 : 0;
  return NextResponse.json({ reviews: safeReviews, average, count: safeReviews.length });
}

export async function POST(request: Request, context: { params: Promise<{ courseId: string }> }) {
  const courseId = courseIdFrom(await context.params);
  const currentUserId = userId(await getServerSession(authOptions));
  if (!currentUserId || !courseId) return NextResponse.json({ error: "Autenticação e curso válidos são necessários." }, { status: 400 });
  const enrollment = await db.query.enrollments.findFirst({ where: and(eq(enrollments.userId, currentUserId), eq(enrollments.courseId, courseId)) });
  if (!enrollment || (enrollment.status !== "completed" && Number(enrollment.progress) < 100)) return NextResponse.json({ error: "Conclua o curso antes de avaliá-lo." }, { status: 403 });
  const body = await request.json();
  const rating = Number(body.rating);
  const comment = String(body.comment || "").trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: "A nota deve estar entre 1 e 5." }, { status: 400 });
  if (comment.length > 2000) return NextResponse.json({ error: "O comentário excede 2.000 caracteres." }, { status: 400 });
  const existing = await db.query.courseReviews.findFirst({ where: and(eq(courseReviews.userId, currentUserId), eq(courseReviews.courseId, courseId)) });
  const review = existing ? (await db.update(courseReviews).set({ rating, comment: comment || null, updatedAt: new Date() }).where(eq(courseReviews.id, existing.id)).returning())[0] : (await db.insert(courseReviews).values({ userId: currentUserId, courseId, rating, comment: comment || null }).returning())[0];
  return NextResponse.json({ review }, { status: existing ? 200 : 201 });
}
