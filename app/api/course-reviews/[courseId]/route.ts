import { NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { courseReviewReplies, courseReviews, enrollments, notifications, users } from "@/drizzle/schema";

function courseIdFrom(params: { courseId: string }) { const value = Number(params.courseId); return Number.isInteger(value) && value > 0 ? value : null; }
function userId(session: { user?: { id?: string | null } } | null) { const value = Number(session?.user?.id); return Number.isInteger(value) && value > 0 ? value : null; }

export async function GET(_request: Request, context: { params: Promise<{ courseId: string }> }) {
  const courseId = courseIdFrom(await context.params);
  if (!courseId) return NextResponse.json({ error: "Curso inválido." }, { status: 400 });
  const reviews = await db.query.courseReviews.findMany({ where: eq(courseReviews.courseId, courseId), with: { user: true }, orderBy: desc(courseReviews.createdAt) });
  const reviewIds = reviews.map((review) => review.id);
  const replies = reviewIds.length ? await db.select({ id: courseReviewReplies.id, reviewId: courseReviewReplies.reviewId, message: courseReviewReplies.message, createdAt: courseReviewReplies.createdAt, authorName: users.name }).from(courseReviewReplies).leftJoin(users, eq(courseReviewReplies.authorId, users.id)).where(inArray(courseReviewReplies.reviewId, reviewIds)).orderBy(desc(courseReviewReplies.createdAt)) : [];
  const safeReviews = reviews.map((review) => ({ id: review.id, rating: review.rating, comment: review.comment, createdAt: review.createdAt, authorName: review.user?.name || "Aluno", replies: replies.filter((reply) => reply.reviewId === review.id).map((reply) => ({ ...reply, authorName: reply.authorName || "Equipe docente" })) }));
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

export async function PATCH(request: Request, context: { params: Promise<{ courseId: string }> }) {
  const courseId = courseIdFrom(await context.params);
  const session = await getServerSession(authOptions);
  const authorId = userId(session);
  if (!authorId || !courseId) return NextResponse.json({ error: "Autenticação e curso válidos são necessários." }, { status: 400 });
  if (session?.user?.role !== "admin" && session?.user?.role !== "professor") return NextResponse.json({ error: "Apenas professores podem responder reviews." }, { status: 403 });
  const body = await request.json();
  const reviewId = Number(body.reviewId);
  const message = String(body.message || "").trim();
  if (!Number.isInteger(reviewId) || !message || message.length > 2000) return NextResponse.json({ error: "Informe uma review válida e uma resposta de até 2.000 caracteres." }, { status: 400 });
  const review = await db.query.courseReviews.findFirst({ where: and(eq(courseReviews.id, reviewId), eq(courseReviews.courseId, courseId)) });
  if (!review) return NextResponse.json({ error: "Review não encontrada." }, { status: 404 });
  const reply = (await db.insert(courseReviewReplies).values({ reviewId, authorId, message }).returning())[0];
  await db.insert(notifications).values({ userId: review.userId, type: "course_review_reply", title: "Sua avaliação recebeu uma resposta", message, metadata: JSON.stringify({ courseId, reviewId, replyId: reply.id }) });
  return NextResponse.json({ reply }, { status: 201 });
}
