import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactMessages } from "@/drizzle/schema";
import { allowContactRequest } from "@/lib/contact-rate-limit";

const MAX_BODY_BYTES = 16_384;

export async function POST(req: Request) {
  try {
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "A mensagem excede o tamanho permitido." }, { status: 413 });
    }

    const rawBody = await req.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "A mensagem excede o tamanho permitido." }, { status: 413 });
    }
    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Formato de mensagem inválido." }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Formato de mensagem inválido." }, { status: 400 });
    }
    const payload = body as Record<string, unknown>;

    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    const subject = typeof payload.subject === "string" ? payload.subject.trim() : "";
    const message = typeof payload.message === "string" ? payload.message.trim() : "";
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!name || name.length > 160 || !validEmail || email.length > 320 || !subject || subject.length > 160 || message.length < 10 || message.length > 5000) {
      return NextResponse.json(
        { error: "Informe nome, e-mail, assunto e mensagem válidos (de 10 a 5.000 caracteres)." },
        { status: 400 }
      );
    }

    const forwardedFor = req.headers.get("x-forwarded-for");
    const forwardedIp = forwardedFor?.split(",")[0]?.trim();
    const ip = req.headers.get("x-real-ip")?.trim() || forwardedIp || "unknown";
    if (!(await allowContactRequest(ip))) {
      return NextResponse.json({ error: "Limite de envios atingido. Tente novamente mais tarde." }, { status: 429 });
    }

    const inserted = await db.insert(contactMessages).values({ name, email, subject, message }).returning();
    return NextResponse.json({ success: true, message: inserted[0] });
  } catch (error) {
    console.error("Erro ao salvar mensagem de contato:", error);
    return NextResponse.json({ error: "Erro interno ao processar a mensagem." }, { status: 500 });
  }
}
