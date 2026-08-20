import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";

export const dynamic = "force-dynamic";

const SUPER_ADMIN_EMAIL = "palafozanderson@gmail.com";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email?.toLowerCase();
    
    if (!session || (session.user.role !== "admin" && userEmail !== SUPER_ADMIN_EMAIL)) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const allUsers = await db.select().from(users);

    const headers = ["ID", "Nome", "Nome Social", "Email", "CPF", "Celular", "Papel", "Status de Aprovacao", "Localizacao", "Data de Cadastro"];
    const rows = allUsers.map((u) => [
      u.id,
      `"${(u.name || "").replace(/"/g, '""')}"`,
      `"${((u as any).socialName || "").replace(/"/g, '""')}"`,
      `"${(u.email || "").replace(/"/g, '""')}"`,
      `"${((u as any).cpf || "").replace(/"/g, '""')}"`,
      `"${(u.phone || "").replace(/"/g, '""')}"`,
      `"${u.role}"`,
      `"${u.approvalStatus}"`,
      `"${(u.location || "").replace(/"/g, '""')}"`,
      `"${new Date(u.createdAt).toLocaleDateString("pt-BR")}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="alunos_e_usuarios_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("Erro ao exportar CSV de usuários:", error);
    return NextResponse.json({ error: "Erro interno ao gerar exportação CSV." }, { status: 500 });
  }
}
