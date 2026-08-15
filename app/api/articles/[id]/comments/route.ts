import { NextResponse } from "next/server";
import { getArticleComments, createArticleComment } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id, 10);
    if (isNaN(articleId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const comments = await getArticleComments(articleId);
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    return NextResponse.json({ error: "Erro interno ao buscar comentários" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id, 10);
    if (isNaN(articleId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const { userName, userEmail, rating, comment } = body;

    if (!userName || !comment) {
      return NextResponse.json({ error: "Nome e comentário são obrigatórios" }, { status: 400 });
    }

    const newComment = await createArticleComment({
      articleId,
      userName,
      userEmail,
      rating: parseInt(rating, 10) || 5,
      comment,
    });

    return NextResponse.json({ success: true, comment: newComment[0] });
  } catch (error) {
    console.error("Erro ao salvar comentário:", error);
    return NextResponse.json({ error: "Erro interno ao salvar comentário" }, { status: 500 });
  }
}
