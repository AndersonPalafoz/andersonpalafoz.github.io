import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { hashPassword, isPasswordAcceptable } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Informe nome e e-mail válidos." }, { status: 400 });
    if (!isPasswordAcceptable(password)) return NextResponse.json({ error: "A senha deve ter ao menos 8 caracteres, uma letra e um número." }, { status: 400 });
    const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (existing) return NextResponse.json({ error: "Já existe uma conta com este e-mail. Entre ou recupere sua senha." }, { status: 409 });

    const created = await db.insert(users).values({ openId: `credentials_${randomUUID()}`, name, email, passwordHash: hashPassword(password), loginMethod: "credentials", role: "user", approvalStatus: "pending" }).returning();
    return NextResponse.json({ created: true, user: { id: created[0]?.id, email, approvalStatus: "pending" } }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Não foi possível criar a conta." }, { status: 500 });
  }
}
