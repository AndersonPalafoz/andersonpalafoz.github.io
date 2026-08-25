import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { passwordResetTokens, users } from "@/drizzle/schema";
import { sendEmailNotification } from "@/lib/email";
import { isPasswordAcceptable, hashPassword } from "@/lib/password";

function hashToken(token: string) { return createHash("sha256").update(token).digest("hex"); }

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const user = await db.query.users.findFirst({ where: eq(users.email, normalizedEmail) });
    const canRecoverExternalPassword = user?.loginMethod === "external-password" && user.mustChangePassword === false && user.approvalStatus === "approved";
    if (user?.email && canRecoverExternalPassword) {
      const token = randomBytes(32).toString("hex");
      await db.insert(passwordResetTokens).values({ userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 30 * 60 * 1000) });
      const origin = request.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";
      const resetUrl = `${origin}/redefinir-senha?token=${token}`;
      await sendEmailNotification({ to: user.email, subject: "Redefinição segura de senha", htmlContent: `<p>Olá, ${user.name || "usuário"}.</p><p>Use o link abaixo para redefinir sua senha. Ele expira em 30 minutos e só pode ser usado uma vez.</p><p><a href="${resetUrl}">${resetUrl}</a></p>` });
    }
    return NextResponse.json({ accepted: true, message: "Se o e-mail estiver cadastrado, enviaremos instruções de recuperação." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ accepted: true, message: "Se o e-mail estiver cadastrado, enviaremos instruções de recuperação." });
  }
}

export async function PUT(request: Request) {
  try {
    const { token, password } = await request.json();
    if (!isPasswordAcceptable(String(password || ""))) return NextResponse.json({ error: "A senha deve ter ao menos 8 caracteres, uma letra e um número." }, { status: 400 });
    const tokenHash = hashToken(String(token || ""));
    const reset = await db.query.passwordResetTokens.findFirst({ where: and(eq(passwordResetTokens.tokenHash, tokenHash), isNull(passwordResetTokens.usedAt)) });
    if (!reset || reset.expiresAt.getTime() < Date.now()) return NextResponse.json({ error: "Token inválido ou expirado." }, { status: 400 });
    const resetUser = await db.query.users.findFirst({ where: eq(users.id, reset.userId) });
    const canResetExternalPassword = resetUser?.loginMethod === "external-password" && resetUser.mustChangePassword === false && resetUser.approvalStatus === "approved";
    if (!canResetExternalPassword) return NextResponse.json({ error: "Esta conta não pode usar este fluxo de recuperação." }, { status: 403 });
    await db.update(users).set({ passwordHash: hashPassword(String(password)), mustChangePassword: false, updatedAt: new Date() }).where(eq(users.id, reset.userId));
    await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, reset.id));
    return NextResponse.json({ reset: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Não foi possível redefinir a senha." }, { status: 500 });
  }
}
