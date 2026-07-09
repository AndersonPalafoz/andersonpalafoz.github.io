import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { articles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

// PUT /api/admin/blog/[id] - Editar postagem
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, slug, content, category, readingTime } = body;
    const { id } = await params;
    const postId = parseInt(id);

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verificar se post existe
    const existingPost = await db.query.articles.findFirst({
      where: eq(articles.id, postId),
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Verificar se novo slug ja existe (e nao eh o mesmo post)
    const slugExists = await db.query.articles.findFirst({
      where: eq(articles.slug, slug),
    });

    if (slugExists && slugExists.id !== postId) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 }
      );
    }

    const updatedPost = await db
      .update(articles)
      .set({
        title,
        slug,
        content,
        category: category || null,
        readingTime: readingTime || 5,
      })
      .where(eq(articles.id, postId))
      .returning();

    return NextResponse.json({
      message: "Post updated successfully",
      post: updatedPost[0],
    });
  } catch (error) {
    console.error("Error updating blog post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/blog/[id] - Deletar postagem
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const postId = parseInt(id);

    // Verificar se post existe
    const existingPost = await db.query.articles.findFirst({
      where: eq(articles.id, postId),
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    await db.delete(articles).where(eq(articles.id, postId));

    return NextResponse.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
