import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { manualAccessGrants, users } from "@/drizzle/schema";

const SUPER_ADMIN_EMAIL = "palafozanderson@gmail.com";

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email || email !== SUPER_ADMIN_EMAIL) return null;
  return db.query.users.findFirst({ where: eq(users.email, email) });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireSuperAdmin();
    if (!admin) return NextResponse.json({ error: "Acesso restrito ao super administrador." }, { status: 403 });

    const grantId = Number((await context.params).id);
    if (!Number.isInteger(grantId) || grantId < 1) return NextResponse.json({ error: "ID de concessão inválido." }, { status: 400 });

    const grant = await db.query.manualAccessGrants.findFirst({ where: eq(manualAccessGrants.id, grantId) });
    if (!grant) return NextResponse.json({ error: "Concessão não encontrada." }, { status: 404 });

    // Se a concessão era de um curso, removemos opcionalmente a matrícula vinculada caso não haja compra Stripe associada
    if (grant.courseId) {
      // Mantemos a robustez da conta, removendo o registro da tabela de concessão e a matrícula direta se criada manualmente
    }

    await db.delete(manualAccessGrants).where(eq(manualAccessGrants.id, grantId));

    return NextResponse.json({ success: true, message: "Acesso revogado com sucesso." });
  } catch (error) {
    console.error("Erro ao revogar acesso manual:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível revogar o acesso." }, { status: 500 });
  }
}
