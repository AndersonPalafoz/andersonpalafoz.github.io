import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { courseReviewReplies, courseReviews, courses, notifications, users } from "@/drizzle/schema";

function adminOnly(session: { user?: { role?: string | null } } | null) {
  return Boolean(session?.user?.role === "admin");
}

function parseCourseId(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

async function loadReviews(courseId: number) {
  const reviews = await db.query.courseReviews.findMany({ where: eq(courseReviews.courseId, courseId), with: { user: true }, orderBy: desc(courseReviews.createdAt) });
  const reviewIds = reviews.map((review) => review.id);
  const replies = reviewIds.length
    ? await db.select({ id: courseReviewReplies.id, reviewId: courseReviewReplies.reviewId, message: courseReviewReplies.message, createdAt: courseReviewReplies.createdAt, authorName: users.name }).from(courseReviewReplies).leftJoin(users, eq(courseReviewReplies.authorId, users.id)).where(inArray(courseReviewReplies.reviewId, reviewIds)).orderBy(desc(courseReviewReplies.createdAt))
    : [];
  return reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    authorName: review.user?.name || "Aluno",
    replies: replies.filter((reply) => reply.reviewId === review.id).map((reply) => ({ ...reply, authorName: reply.authorName || "Usuário identificado" })),
  }));
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!adminOnly(session)) return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    const courseId = parseCourseId(request.nextUrl.searchParams.get("courseId"));
    const availableCourses = await db.query.courses.findMany({ where: isNull(courses.deletedAt), columns: { id: true, title: true }, orderBy: (table, { asc }) => asc(table.title) });
    const reviews = courseId ? await loadReviews(courseId) : [];
    return NextResponse.json({ courses: availableCourses, reviews, courseId });
  } catch (error) {
    console.error("Error loading admin reviews:", error);
    return NextResponse.json({ error: "Não foi possível carregar as avaliações reais." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!adminOnly(session) || !session?.user?.email) return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    const body = await request.json();
    const courseId = parseCourseId(String(body.courseId || ""));
    const reviewId = Number(body.reviewId);
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!courseId || !Number.isInteger(reviewId) || reviewId <= 0 || !message || message.length > 2000) {
      return NextResponse.json({ error: "Informe curso, avaliação e resposta válida de até 2.000 caracteres." }, { status: 400 });
    }
    const review = await db.query.courseReviews.findFirst({ where: and(eq(courseReviews.id, reviewId), eq(courseReviews.courseId, courseId)) });
    if (!review) return NextResponse.json({ error: "Avaliação não encontrada." }, { status: 404 });
    const author = session.user?.email ? await db.query.users.findFirst({ where: eq(users.email, session.user.email) }) : null;
    if (!author) return NextResponse.json({ error: "Administrador não encontrado no banco." }, { status: 403 });
    const [reply] = await db.insert(courseReviewReplies).values({ reviewId, authorId: author.id, message }).returning();
    await db.insert(notifications).values({ userId: review.userId, type: "course_review_reply", title: "Sua avaliação recebeu uma resposta", message, metadata: JSON.stringify({ courseId, reviewId, replyId: reply.id }) });
    return NextResponse.json({ reply: { ...reply, authorName: author.name || author.email || "Administrador" } }, { status: 201 });
  } catch (error) {
    console.error("Error replying to admin review:", error);
    return NextResponse.json({ error: "Não foi possível salvar a resposta." }, { status: 500 });
  }
}
