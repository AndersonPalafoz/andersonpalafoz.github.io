import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword, isPasswordAcceptable } from "@/lib/password";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);
  if (!Number.isInteger(userId) || userId <= 0) return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const password = String(body.password || "");
  const confirmation = String(body.confirmation || "");
  if (!isPasswordAcceptable(password) || password.length < 12 || !/[A-Z]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return NextResponse.json({ error: "Use uma senha forte com pelo menos 12 caracteres, incluindo maiúscula, número e símbolo." }, { status: 400 });
  }
  if (password !== confirmation) return NextResponse.json({ error: "As senhas não coincidem." }, { status: 400 });

  await db.update(users).set({ passwordHash: hashPassword(password), mustChangePassword: false, updatedAt: new Date() }).where(eq(users.id, userId));
  return NextResponse.json({ ok: true, message: "Senha atualizada. Seu acesso está liberado." });
}
