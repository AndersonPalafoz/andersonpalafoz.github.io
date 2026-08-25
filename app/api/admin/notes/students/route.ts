import { NextResponse } from "next/server";
import { asc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { requireAdmin } from "@/lib/admin-auth";

/** Lista somente alunos ativos para a busca administrativa de anotações. */
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Acesso restrito a administradores e professores." }, { status: 403 });
  }

  try {
    const students = await db.query.users.findMany({
      where: (user, { and }) => and(eq(user.role, "user"), isNull(user.deletedAt)),
      columns: { id: true, name: true, email: true, role: true, deletedAt: true },
      orderBy: [asc(users.name), asc(users.email)],
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Error fetching note students:", error);
    return NextResponse.json({ error: "Não foi possível carregar a lista de alunos." }, { status: 500 });
  }
}
