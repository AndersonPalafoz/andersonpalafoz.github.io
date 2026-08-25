import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { contactMessages } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase();
    const isAdmin = session?.user?.role === "admin" || email === "palafozanderson@gmail.com";

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt))
      .limit(200);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Erro ao listar mensagens de contato:", error);
    return NextResponse.json({ error: "Erro interno ao listar mensagens." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase();
    const isAdmin = session?.user?.role === "admin" || email === "palafozanderson@gmail.com";

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, isRead, replyText } = body;

    if (!id) {
      return NextResponse.json({ error: "ID da mensagem é obrigatório." }, { status: 400 });
    }

    const targetMessage = await db.query.contactMessages.findFirst({
      where: eq(contactMessages.id, Number(id)),
    });

    if (!targetMessage) {
      return NextResponse.json({ error: "Mensagem não encontrada." }, { status: 404 });
    }

    let updatedIsRead = targetMessage.isRead;
    let readAt = targetMessage.readAt;

    if (typeof isRead === "boolean") {
      updatedIsRead = isRead;
      readAt = isRead ? new Date() : null;
    }

    const reply = typeof replyText === "string" ? replyText.trim() : "";
    if (reply.length > 0) {
      // A resposta fica no painel para manter o atendimento centralizado no site.
      updatedIsRead = true;
      readAt = readAt || new Date();
    }

    const updated = await db
      .update(contactMessages)
      .set({
        isRead: updatedIsRead,
        readAt,
        ...(reply.length > 0 ? {
          adminReply: reply,
          repliedAt: new Date(),
          repliedBy: email || null,
        } : {}),
      })
      .where(eq(contactMessages.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, message: updated[0] });
  } catch (error) {
    console.error("Erro ao atualizar ou responder mensagem:", error);
    return NextResponse.json({ error: "Erro interno ao processar a solicitação." }, { status: 500 });
  }
}
