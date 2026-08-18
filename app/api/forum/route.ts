import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { and, count, desc, eq, or } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { forumPostLikes, forumPosts, forumReplies, users } from "@/drizzle/schema";

const CATEGORIES = ["Gramática", "Pronúncia", "Dicas", "Vocabulário"] as const;
const MAX_PAGE_SIZE = 50;

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

async function getCounts(postIds: number[]) {
  if (postIds.length === 0) return { replies: new Map<number, number>(), likes: new Map<number, number>() };
  // Otimização para plano gratuito do Neon: agrupar contagens em uma única passagem se possível ou limitar lote
  if (postIds.length > 50) postIds = postIds.slice(0, 50);

  const [replyRows, likeRows] = await Promise.all([
    db.select({ postId: forumReplies.postId, total: count() })
      .from(forumReplies)
      .where(or(...postIds.map((postId) => eq(forumReplies.postId, postId))))
      .groupBy(forumReplies.postId),
    db.select({ postId: forumPostLikes.postId, total: count() })
      .from(forumPostLikes)
      .where(or(...postIds.map((postId) => eq(forumPostLikes.postId, postId))))
      .groupBy(forumPostLikes.postId),
  ]);

  return {
    replies: new Map(replyRows.map((row) => [row.postId, Number(row.total)])),
    likes: new Map(likeRows.map((row) => [row.postId, Number(row.total)])),
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search")?.trim().slice(0, 120) || "";
    const category = searchParams.get("category")?.trim() || "";
    const limit = Math.min(parsePositiveInt(searchParams.get("limit"), 20) || 20, MAX_PAGE_SIZE);
    const offset = parsePositiveInt(searchParams.get("offset"), 0);

    const filters = [
      or(eq(forumPosts.status, "approved"), eq(forumPosts.status, "resolved")),
      ...(category && category !== "Todos" && CATEGORIES.includes(category as (typeof CATEGORIES)[number])
        ? [eq(forumPosts.category, category)]
        : []),
      ...(search ? [or(eq(forumPosts.title, search), eq(forumPosts.content, search))] : []),
    ];

    const rows = await db
      .select({
        id: forumPosts.id,
        title: forumPosts.title,
        category: forumPosts.category,
        content: forumPosts.content,
        audioUrl: forumPosts.audioUrl,
        status: forumPosts.status,
        createdAt: forumPosts.createdAt,
        authorName: users.name,
        authorAvatarUrl: users.avatarUrl,
      })
      .from(forumPosts)
      .innerJoin(users, eq(forumPosts.authorId, users.id))
      .where(and(...filters))
      .orderBy(desc(forumPosts.createdAt))
      .limit(limit)
      .offset(offset);

    const counts = await getCounts(rows.map((row) => row.id));
    return NextResponse.json({
      posts: rows.map((row) => ({
        ...row,
        author: row.authorName || "Usuário",
        likes: counts.likes.get(row.id) || 0,
        replies: counts.replies.get(row.id) || 0,
      })),
      pagination: { limit, offset, hasMore: rows.length === limit },
      categories: CATEGORIES,
    });
  } catch (error) {
    console.error("Error loading forum posts:", error);
    return NextResponse.json({ error: "Não foi possível carregar os tópicos persistidos." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = Number(session?.user?.id);
    if (!session?.user || !Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "É necessário estar autenticado para publicar." }, { status: 401 });
    }

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const audioUrl = typeof body.audioUrl === "string" && body.audioUrl.trim() ? body.audioUrl.trim() : null;

    if (title.length < 3 || title.length > 200 || content.length < 3 || content.length > 10000) {
      return NextResponse.json({ error: "Título ou conteúdo inválido." }, { status: 400 });
    }
    if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
      return NextResponse.json({ error: "Categoria inválida." }, { status: 400 });
    }

    const [post] = await db.insert(forumPosts).values({
      authorId: userId,
      title,
      category,
      content,
      audioUrl,
      status: "pending",
    }).returning();

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Error creating forum post:", error);
    return NextResponse.json({ error: "Não foi possível publicar o tópico." }, { status: 500 });
  }
}
