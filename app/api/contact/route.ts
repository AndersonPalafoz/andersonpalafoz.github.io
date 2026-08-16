import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactMessages } from "@/drizzle/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message || message.length < 10) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios e a mensagem deve ter pelo menos 10 caracteres." },
        { status: 400 }
      );
    }

    const inserted = await db.insert(contactMessages).values({
      name: String(name).trim(),
      email: String(email).trim(),
      subject: String(subject).trim(),
      message: String(message).trim(),
    }).returning();

    return NextResponse.json({ success: true, message: inserted[0] });
  } catch (error) {
    console.error("Erro ao salvar mensagem de contato:", error);
    return NextResponse.json({ error: "Erro interno ao processar a mensagem." }, { status: 500 });
  }
}
