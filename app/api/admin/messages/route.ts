import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { contactMessages } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { sendEmailNotification } from "@/lib/email";

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
    const { id, isRead, replyText, subject: replySubject } = body;

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

    if (replyText && replyText.trim().length > 0) {
      // Disparar email de resposta para o remetente
      const subject = replySubject || `Re: ${targetMessage.subject} - Anderson Palafoz Platform`;
      const htmlContent = `
        <div style="font-family:sans-serif;color:#1F1F1F;line-height:1.6;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:12px;">
          <h2 style="color:#dc2626;margin-top:0;">Resposta de Anderson Palafoz</h2>
          <p>Olá, <strong>${targetMessage.name}</strong>,</p>
          <p>Recebemos sua mensagem enviada através da plataforma com o assunto <em>"${targetMessage.subject}"</em>.</p>
          <blockquote style="margin:20px 0;padding:12px 16px;background:#f3f4f6;border-left:4px solid #dc2626;color:#4b5563;">
            ${replyText.replace(/\n/g, "<br/>")}
          </blockquote>
          <p>Atenciosamente,<br/><strong>Anderson Palafoz</strong><br/>Professor de Inglês & Especialista em Educação</p>
        </div>
      `;

      await sendEmailNotification({
        to: targetMessage.email,
        subject,
        htmlContent,
      });

      updatedIsRead = true;
      readAt = readAt || new Date();
    }

    const updated = await db
      .update(contactMessages)
      .set({
        isRead: updatedIsRead,
        readAt,
      })
      .where(eq(contactMessages.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, message: updated[0] });
  } catch (error) {
    console.error("Erro ao atualizar ou responder mensagem:", error);
    return NextResponse.json({ error: "Erro interno ao processar a solicitação." }, { status: 500 });
  }
}
