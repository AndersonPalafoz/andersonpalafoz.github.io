import { NextResponse } from "next/server";
import { getPublicArticles } from "@/lib/public-content";

export async function GET() {
  const { articles, available } = await getPublicArticles(100);

  if (!available) {
    return NextResponse.json(
      { error: "Conteúdo temporariamente indisponível." },
      { status: 503 },
    );
  }

  return NextResponse.json({ articles });
}
