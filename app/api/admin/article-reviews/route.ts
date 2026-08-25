import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { articleComments, articleCommentReplies, articles, notifications, users } from "@/drizzle/schema";

export const dynamic = "force-dynamic";

function adminOnly(session: { user?: { role?: string | null } } | null) {
  return Boolean(session?.user?.role === "admin");
}

function parseId(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

async function loadArticleReviews(articleId: number) {
  const comments = await db.query.articleComments.findMany({
    where: eq(articleComments.articleId, articleId),
    orderBy: desc(articleComments.createdAt),
  });

  const commentIds = comments.map((c) => c.id);
  const replies = commentIds.length
    ? await db
        .select({
          id: articleCommentReplies.id,
          commentId: articleCommentReplies.commentId,
          message: articleCommentReplies.message,
          createdAt: articleCommentReplies.createdAt,
          authorName: users.name,
        })
        .from(articleCommentReplies)
        .leftJoin(users, eq(articleCommentReplies.authorId, users.id))
        .where(inArray(articleCommentReplies.commentId, commentIds))
        .orderBy(desc(articleCommentReplies.createdAt))
    : [];

  return comments.map((comment) => ({
    id: comment.id,
    moderationStatus: comment.moderationStatus,
    rating: comment.rating ?? 5,
    comment: comment.comment,
    createdAt: comment.createdAt,
    authorName: comment.userName || "Leitor do Blog",
    replies: replies
      .filter((reply) => reply.commentId === comment.id)
      .map((reply) => ({ ...reply, authorName: reply.authorName || "Professor Anderson Palafoz" })),
  }));
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!adminOnly(session)) {
      return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    }

    const articleId = parseId(request.nextUrl.searchParams.get("articleId"));
    const availableArticles = await db.select({ id: articles.id, title: articles.title }).from(articles).orderBy(desc(articles.published));
    const reviews = articleId ? await loadArticleReviews(articleId) : [];

    return NextResponse.json({ articles: availableArticles, reviews, articleId });
  } catch (error) {
    console.error("Error loading admin article reviews:", error);
    return NextResponse.json({ error: "Não foi possível carregar os comentários do blog." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!adminOnly(session) || !session?.user?.email) {
      return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    }

    const body = await request.json();
    const articleId = parseId(String(body.articleId || ""));
    const reviewId = Number(body.reviewId);
    const action = typeof body.action === "string" ? body.action : "reply";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!articleId || !Number.isInteger(reviewId) || reviewId <= 0) {
      return NextResponse.json({ error: "Informe um artigo e comentário válidos." }, { status: 400 });
    }

    const comment = await db.query.articleComments.findFirst({
      where: and(eq(articleComments.id, reviewId), eq(articleComments.articleId, articleId)),
    });

    if (!comment) {
      return NextResponse.json({ error: "Comentário não encontrado." }, { status: 404 });
    }

    const author = session.user?.email ? await db.query.users.findFirst({ where: eq(users.email, session.user.email) }) : null;
    if (!author) {
      return NextResponse.json({ error: "Administrador não encontrado no banco." }, { status: 403 });
    }

    if (["hide", "restore", "delete"].includes(action)) {
      const moderationStatus = action === "hide" ? "hidden" : action === "delete" ? "deleted" : "visible";
      const [updated] = await db.update(articleComments).set({ moderationStatus, moderatedAt: new Date(), moderatedBy: author.id }).where(and(eq(articleComments.id, reviewId), eq(articleComments.articleId, articleId))).returning();
      return NextResponse.json({ comment: { id: updated.id, moderationStatus: updated.moderationStatus } });
    }

    if (action !== "reply" || !message || message.length > 2000) {
      return NextResponse.json({ error: "Informe artigo, comentário e resposta válida de até 2.000 caracteres." }, { status: 400 });
    }

    const [reply] = await db.insert(articleCommentReplies).values({
      commentId: reviewId,
      authorId: author.id,
      message,
    }).returning();

    return NextResponse.json({
      reply: { ...reply, authorName: author.name || "Professor Anderson Palafoz" },
    }, { status: 201 });
  } catch (error) {
    console.error("Error replying to admin article comment:", error);
    return NextResponse.json({ error: "Não foi possível salvar a resposta ao comentário." }, { status: 500 });
  }
}
