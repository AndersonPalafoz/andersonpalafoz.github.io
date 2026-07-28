import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { MIGRATION_STATEMENTS } from "@/lib/migration-sql";

// Endpoint TEMPORARIO para criar as tabelas do banco de producao sem
// precisar de terminal. Protegido: so funciona logado como admin.
//
// O SQL das migrations fica embutido em lib/migration-sql.ts (em vez
// de ser lido de drizzle/migrations/*.sql em runtime) porque a
// primeira tentativa, usando drizzle-orm/postgres-js/migrator direto,
// falhou com "Can't find meta/_journal.json" -- os arquivos da pasta
// migrations nao ficaram disponiveis do jeito esperado no pacote da
// funcao serverless na Vercel. Executar cada statement isoladamente
// e tolerar "already exists" torna isso seguro de rodar mais de uma
// vez, sem depender de nenhum arquivo em disco em runtime.
//
// Remover essa rota depois de usada.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await import("@/lib/db");
    const { sql } = await import("drizzle-orm");

    const aplicados: string[] = [];
    const ignorados: string[] = [];

    for (const statement of MIGRATION_STATEMENTS) {
      try {
        await db.execute(sql.raw(statement));
        aplicados.push(statement.slice(0, 60));
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        // "ja existe" cobre re-execucoes seguras (rodar de novo sem quebrar)
        if (/already exists/i.test(msg)) {
          ignorados.push(statement.slice(0, 60));
        } else {
          throw error;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Migrations aplicadas com sucesso. As tabelas do banco foram criadas.",
      total_statements: MIGRATION_STATEMENTS.length,
      aplicados: aplicados.length,
      ja_existiam: ignorados.length,
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
