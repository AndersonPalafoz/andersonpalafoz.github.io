import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { siteContentBlocks } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const blocks = await db.select().from(siteContentBlocks).orderBy(desc(siteContentBlocks.updatedAt));
    return NextResponse.json({ blocks });
  } catch (error) {
    console.error("CMS GET error:", error);
    return NextResponse.json({ error: "Erro ao carregar conteúdos do CMS." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const body = await request.json();
    const { action, id, pageKey, sectionKey, title, content, status, contentType, orderIndex, tag } = body;

    if (action === "duplicate" && id) {
      const source = await db.query.siteContentBlocks.findFirst({
        where: eq(siteContentBlocks.id, Number(id)),
      });
      if (!source) {
        return NextResponse.json({ error: "Bloco original não encontrado." }, { status: 404 });
      }
      const duplicated = await db.insert(siteContentBlocks).values({
        pageKey: source.pageKey,
        sectionKey: `${source.sectionKey}_copy_${Date.now().toString().slice(-4)}`,
        title: `${source.title} (Cópia)`,
        content: source.content,
        status: source.status,
        contentType: source.contentType,
        orderIndex: source.orderIndex + 1,
        tag: source.tag,
        updatedAt: new Date(),
      }).returning();
      return NextResponse.json({ block: duplicated[0], message: "Bloco duplicado com sucesso!" });
    }

    if (!pageKey || !sectionKey || !title || content === undefined) {
      return NextResponse.json({ error: "Preencha todos os campos obrigatórios do bloco." }, { status: 400 });
    }

    const existing = await db.query.siteContentBlocks.findFirst({
      where: eq(siteContentBlocks.sectionKey, sectionKey),
    });

    if (existing) {
      const updated = await db.update(siteContentBlocks)
        .set({
          pageKey,
          title,
          content,
          status: status || "published",
          contentType: contentType || "text",
          orderIndex: orderIndex !== undefined ? Number(orderIndex) : 0,
          tag: tag || "Geral",
          updatedAt: new Date(),
        })
        .where(eq(siteContentBlocks.id, existing.id))
        .returning();
      return NextResponse.json({ block: updated[0], message: "Bloco atualizado com sucesso!" });
    } else {
      const created = await db.insert(siteContentBlocks)
        .values({
          pageKey,
          sectionKey,
          title,
          content,
          status: status || "published",
          contentType: contentType || "text",
          orderIndex: orderIndex !== undefined ? Number(orderIndex) : 0,
          tag: tag || "Geral",
          updatedAt: new Date(),
        })
        .returning();
      return NextResponse.json({ block: created[0], message: "Bloco criado com sucesso!" });
    }
  } catch (error) {
    console.error("CMS POST error:", error);
    return NextResponse.json({ error: "Erro ao salvar conteúdo no CMS." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    await db.delete(siteContentBlocks).where(eq(siteContentBlocks.id, Number(id)));
    return NextResponse.json({ success: true, message: "Bloco removido com sucesso." });
  } catch (error) {
    console.error("CMS DELETE error:", error);
    return NextResponse.json({ error: "Erro ao excluir bloco do CMS." }, { status: 500 });
  }
}
