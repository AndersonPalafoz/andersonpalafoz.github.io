import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { lessonNotes, users } from "@/drizzle/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { ADMIN_AUDIT_ACTIONS, logAdminActivity } from "@/lib/admin-audit";

function parseId(value: string | null) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// GET /api/admin/notes?studentId=123 - Lista todas as anotações de um aluno,
// incluindo as já sinalizadas como excluídas por um administrador.
export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Acesso restrito a administradores e professores." }, { status: 403 });

  const studentId = parseId(new URL(request.url).searchParams.get("studentId"));
  if (!studentId) return NextResponse.json({ error: "studentId inválido." }, { status: 400 });

  const student = await db.query.users.findFirst({ where: eq(users.id, studentId) });
  if (!student) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

  const notes = await db.query.lessonNotes.findMany({
    where: eq(lessonNotes.userId, studentId),
    with: { lesson: true },
    orderBy: desc(lessonNotes.updatedAt),
  });

  return NextResponse.json({
    student: { id: student.id, name: student.name, email: student.email },
    notes,
  });
}

// DELETE /api/admin/notes?id=456 - Sinaliza a anotação como excluída por um
// administrador. O texto original é preservado no banco (para auditoria),
// mas deixa de ser exibido ao aluno, que vê um aviso no lugar.
export async function DELETE(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Acesso restrito a administradores e professores." }, { status: 403 });
  if (session.user.role !== "admin" && session.user.role !== "super_admin" && session.user.email?.toLowerCase() !== "palafozanderson@gmail.com") {
    return NextResponse.json({ error: "Somente administradores podem excluir anotações de alunos." }, { status: 403 });
  }

  const noteId = parseId(new URL(request.url).searchParams.get("id"));
  if (!noteId) return NextResponse.json({ error: "id inválido." }, { status: 400 });

  const existing = await db.query.lessonNotes.findFirst({
    where: eq(lessonNotes.id, noteId),
    with: { lesson: true, user: true },
  });
  if (!existing) return NextResponse.json({ error: "Anotação não encontrada." }, { status: 404 });
  if (existing.deletedByAdminAt) return NextResponse.json({ error: "Esta anotação já foi excluída por um administrador." }, { status: 400 });

  const adminEmail = session.user.email ?? "admin";
  const [updated] = await db
    .update(lessonNotes)
    .set({ deletedByAdminAt: new Date(), deletedByAdminEmail: adminEmail })
    .where(and(eq(lessonNotes.id, noteId), eq(lessonNotes.userId, existing.userId)))
    .returning();

  await logAdminActivity({
    adminEmail,
    action: ADMIN_AUDIT_ACTIONS.SOFT_DELETE,
    targetName: existing.user?.name ?? undefined,
    targetEmail: existing.user?.email ?? undefined,
    details: `Anotação da aula "${existing.lesson?.title ?? `#${existing.lessonId}`}" excluída por um administrador.`,
  });

  return NextResponse.json({ note: updated });
}
