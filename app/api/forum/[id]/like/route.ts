import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { and, count, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { forumPostLikes, forumPosts } from "@/drizzle/schema";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = Number(session?.user?.id);
    if (!session?.user || !Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "É necessário estar autenticado para curtir." }, { status: 401 });
    }

    const postId = Number((await context.params).id);
    if (!Number.isInteger(postId) || postId <= 0) {
      return NextResponse.json({ error: "Tópico inválido." }, { status: 400 });
    }

    const post = await db.query.forumPosts.findFirst({
      where: and(
        eq(forumPosts.id, postId),
        eq(forumPosts.status, "approved"),
      ),
    });
    if (!post) return NextResponse.json({ error: "Tópico não encontrado." }, { status: 404 });

    const existingLike = await db.query.forumPostLikes.findFirst({
      where: and(eq(forumPostLikes.postId, postId), eq(forumPostLikes.userId, userId)),
    });

    if (existingLike) {
      await db.delete(forumPostLikes).where(eq(forumPostLikes.id, existingLike.id));
    } else {
      await db.insert(forumPostLikes).values({ postId, userId });
    }

    const [likes] = await db
      .select({ total: count() })
      .from(forumPostLikes)
      .where(eq(forumPostLikes.postId, postId));

    return NextResponse.json({ liked: !existingLike, likes: Number(likes?.total || 0) });
  } catch (error) {
    console.error("Error toggling forum like:", error);
    return NextResponse.json({ error: "Não foi possível atualizar a curtida." }, { status: 500 });
  }
}
