import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, getUserByEmail } from "@/lib/db";
import { materialComments, users } from "@/drizzle/schema";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const materialId = parseInt(resolvedParams.id);
    if (isNaN(materialId)) return NextResponse.json({ error: "ID de material inválido" }, { status: 400 });

    const rows = await db
      .select({
        id: materialComments.id,
        content: materialComments.content,
        parentId: materialComments.parentId,
        createdAt: materialComments.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(materialComments)
      .innerJoin(users, eq(materialComments.userId, users.id))
      .where(eq(materialComments.materialId, materialId))
      .orderBy(desc(materialComments.createdAt));

    return NextResponse.json({ comments: rows });
  } catch (error) {
    console.error("Error loading comments:", error);
    return NextResponse.json({ error: "Falha ao carregar comentários" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const user = await getUserByEmail(session.user.email);
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const resolvedParams = await params;
    const materialId = parseInt(resolvedParams.id);
    if (isNaN(materialId)) return NextResponse.json({ error: "ID de material inválido" }, { status: 400 });

    const body = await request.json();
    const { content, parentId } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "O comentário não pode estar vazio" }, { status: 400 });
    }

    await db.insert(materialComments).values({
      materialId,
      userId: user.id,
      content: content.trim(),
      parentId: parentId ? parseInt(parentId) : null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error posting comment:", error);
    return NextResponse.json({ error: "Falha ao enviar comentário" }, { status: 500 });
  }
}
