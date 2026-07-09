import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { articles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

// GET /api/admin/blog - Listar todas as postagens
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const allPosts = await db.query.articles.findMany();

    return NextResponse.json({
      posts: allPosts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        category: post.category,
        published: post.published,
        readingTime: post.readingTime,
        createdAt: post.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/blog - Criar nova postagem
export async function POST(request: NextRequest) {
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

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verificar se slug ja existe
    const existingPost = await db.query.articles.findFirst({
      where: eq(articles.slug, slug),
    });

    if (existingPost) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 }
      );
    }

    const newPost = await db
      .insert(articles)
      .values({
        title,
        slug,
        content,
        category: category || null,
        readingTime: readingTime || 5,
        published: new Date(),
      })
      .returning();

    return NextResponse.json({
      message: "Post created successfully",
      post: newPost[0],
    });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
