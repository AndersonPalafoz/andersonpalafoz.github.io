import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Endpoint TEMPORARIO para aplicar a migration 0004 (colunas de perfil:
// phone, location, bio em users) direto no banco de producao, sem
// terminal. Protegido: so funciona logado como admin. Mesmo padrao
// usado para a migration inicial (ver historico do git) -- SQL
// embutido direto no codigo para nao depender de arquivo em disco em
// runtime. Remover depois de usado.
const STATEMENTS = [
  `ALTER TABLE "enrollments" ALTER COLUMN "progress" SET DATA TYPE integer`,
  `ALTER TABLE "enrollments" ALTER COLUMN "currentModule" SET DATA TYPE integer`,
  `ALTER TABLE "materials" ALTER COLUMN "downloads" SET DATA TYPE integer`,
  `ALTER TABLE "users" ADD COLUMN "phone" varchar(32)`,
  `ALTER TABLE "users" ADD COLUMN "location" varchar(120)`,
  `ALTER TABLE "users" ADD COLUMN "bio" text`,
];

function extrairDetalhe(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const causa = "cause" in error && error.cause ? String(error.cause) : "";
  return `${error.message} | causa: ${causa}`;
}

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
    const detalhesErro: string[] = [];

    for (const statement of STATEMENTS) {
      try {
        await db.execute(sql.raw(statement));
        aplicados.push(statement);
      } catch (error) {
        const detalhe = extrairDetalhe(error);
        if (/already exists/i.test(detalhe)) {
          ignorados.push(statement);
        } else {
          detalhesErro.push(`${statement} -- ${detalhe}`);
        }
      }
    }

    if (detalhesErro.length > 0) {
      return NextResponse.json(
        { success: false, error: "Algumas alteracoes falharam.", detalhes: detalhesErro },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Migration 0004 aplicada com sucesso.",
      aplicados,
      ja_existiam: ignorados,
    });
  } catch (error) {
    console.error("Error running migration:", error);
    return NextResponse.json({ success: false, error: extrairDetalhe(error) }, { status: 500 });
  }
}
