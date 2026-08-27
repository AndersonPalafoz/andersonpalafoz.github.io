import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { externalClasses, externalStudents, users } from "@/drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { hashPassword } from "@/lib/password";
import { sendEmailNotification } from "@/lib/email";
import { canManageExternalClass, requireTeacherOrAdmin } from "@/lib/admin-auth";

function temporaryPassword() {
  return `AP-${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}!9a`;
}

export async function POST(request: NextRequest) {
  const session = await requireTeacherOrAdmin();
  if (!session) return NextResponse.json({ error: "Acesso restrito a professores e administradores." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const classId = Number(body.classId);
  const resend = body.action === "resend";
  const requestedIds = Array.isArray(body.studentIds) ? body.studentIds.map(Number).filter(Number.isInteger) : [];
  if (!Number.isInteger(classId) || classId <= 0) return NextResponse.json({ error: "Turma inválida." }, { status: 400 });

  const externalClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, classId) });
  if (!externalClass) return NextResponse.json({ error: "Turma não encontrada." }, { status: 404 });
  if (!(await canManageExternalClass(session, classId))) {
    return NextResponse.json({ error: "Professores só podem gerenciar o acesso de alunos em suas próprias turmas." }, { status: 403 });
  }
  const students = await db.query.externalStudents.findMany({ where: requestedIds.length ? inArray(externalStudents.id, requestedIds) : eq(externalStudents.externalClassId, classId) });
  const classStudents = students.filter((student) => student.externalClassId === classId && student.email);
  let created = 0;
  let linked = 0;
  let emailed = 0;

  for (const student of classStudents) {
    const email = student.email!.trim().toLowerCase();
    let account = await db.query.users.findFirst({ where: eq(users.email, email) });
    let temporary: string | null = null;
    if (!account) {
      temporary = temporaryPassword();
      const [createdUser] = await db.insert(users).values({ openId: `external-${crypto.randomUUID()}`, name: student.socialName || student.name, email, passwordHash: hashPassword(temporary), mustChangePassword: true, loginMethod: "external-password", role: "user", approvalStatus: "approved" }).returning();
      account = createdUser;
      created += 1;
    } else if (resend && account.loginMethod === "external-password") {
      temporary = temporaryPassword();
      await db.update(users).set({ passwordHash: hashPassword(temporary), mustChangePassword: true, approvalStatus: "approved", updatedAt: new Date() }).where(eq(users.id, account.id));
    } else if (!account.passwordHash && account.loginMethod !== "google") {
      temporary = temporaryPassword();
      await db.update(users).set({ passwordHash: hashPassword(temporary), mustChangePassword: true, loginMethod: "external-password", approvalStatus: "approved", updatedAt: new Date() }).where(eq(users.id, account.id));
    }
    if (account.id !== student.userId) {
      await db.update(externalStudents).set({ userId: account.id, updatedAt: new Date() }).where(eq(externalStudents.id, student.id));
      linked += 1;
    }
    if (temporary) {
      const loginUrl = `${process.env.NEXTAUTH_URL || "https://andersonpalafoz.vercel.app"}/login`;
      const safeName = (student.socialName || student.name).replace(/[<>]/g, "");
      await sendEmailNotification({ to: email, subject: "Seu acesso à Área do Aluno", htmlContent: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Olá, ${safeName}!</h2><p>Seu acesso à turma <strong>${externalClass.courseName}</strong> foi criado.</p><p><strong>E-mail:</strong> ${email}<br/><strong>Senha temporária:</strong> ${temporary}</p><p><a href="${loginUrl}">Entrar na plataforma</a></p><p>No primeiro acesso, você deverá cadastrar uma nova senha forte. A senha temporária não continuará válida após essa troca.</p></div>`, textContent: `Olá, ${safeName}! Acesse ${loginUrl} com o e-mail ${email} e a senha temporária ${temporary}. No primeiro acesso, troque-a por uma senha forte.` });
      emailed += 1;
    }
  }
  return NextResponse.json({ ok: true, total: classStudents.length, created, linked, emailed, skippedWithoutEmail: students.length - classStudents.length });
}
