import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Endpoint TEMPORARIO para aplicar as migrations do Drizzle direto no
// banco de producao, sem precisar de acesso a terminal. Protegido:
// so funciona para quem esta logado como admin. Aceita GET de proposito
// (para poder ser executado so abrindo o link no navegador).
// Remover depois de usado uma vez (migrations sao idempotentes, mas
// nao ha motivo para deixar essa rota exposta indefinidamente).
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await import("@/lib/db");
    const { migrate } = await import("drizzle-orm/postgres-js/migrator");

    await migrate(db, { migrationsFolder: "./drizzle/migrations" });

    return NextResponse.json({
      success: true,
      message: "Migrations aplicadas com sucesso. As tabelas do banco foram criadas.",
    });
  } catch (error) {
    console.error("Error running migrations:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Falha ao aplicar migrations",
      },
      { status: 500 }
    );
  }
}
