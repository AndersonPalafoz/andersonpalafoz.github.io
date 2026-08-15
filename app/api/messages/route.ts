import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { directMessages, users } from "@/drizzle/schema";
import { eq, or, desc } from "drizzle-orm";
import { sendEmailNotification } from "@/lib/email";

export async function GET(_req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const messages = await db.query.directMessages.findMany({
      where: or(
        eq(directMessages.senderId, userId),
        eq(directMessages.receiverId, userId)
      ),
      orderBy: desc(directMessages.createdAt),
    });

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("Erro ao buscar mensagens diretas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const senderId = Number(session.user.id);
    const bodyJson = await req.json();
    const { receiverId, subject, body } = bodyJson;

    if (!receiverId || !subject || !body || body.trim().length < 5) {
      return NextResponse.json(
        { error: "Destinatário, assunto e corpo da mensagem (mínimo 5 caracteres) são obrigatórios." },
        { status: 400 }
      );
    }

    const recipient = await db.query.users.findFirst({
      where: eq(users.id, Number(receiverId)),
    });

    if (!recipient) {
      return NextResponse.json({ error: "Destinatário não encontrado" }, { status: 404 });
    }

    const [inserted] = await db.insert(directMessages).values({
      senderId,
      receiverId: Number(receiverId),
      subject: String(subject).trim(),
      body: String(body).trim(),
      isRead: false,
    }).returning();

    // Enviar notificação por e-mail para o destinatário
    if (recipient.email) {
      await sendEmailNotification({
        to: recipient.email,
        subject: `[Anderson Palafoz] Nova mensagem de ${session.user.name || "Usuário"}`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; color: #1f1f1f; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #dc2626; margin-top: 0;">Nova Mensagem Direta</h2>
            <p><strong>De:</strong> ${session.user.name || "Usuário"} (${session.user.email})</p>
            <p><strong>Assunto:</strong> ${subject}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="white-space: pre-wrap; line-height: 1.6;">${body}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="font-size: 12px; color: #6b7280;">Acesse a plataforma Anderson Palafoz para responder e acompanhar o histórico de conversas.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true, message: inserted });
  } catch (error) {
    console.error("Erro ao enviar mensagem direta:", error);
    return NextResponse.json({ error: "Erro interno ao enviar mensagem" }, { status: 500 });
  }
}
