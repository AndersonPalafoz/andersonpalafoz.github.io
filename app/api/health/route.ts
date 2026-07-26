import { NextResponse } from "next/server";

// Endpoint de diagnostico TEMPORARIO -- so reporta se as variaveis de
// ambiente criticas estao configuradas (true/false, nunca o valor) e
// se a conexao com o banco funciona. Nao expoe segredos.
// Remover depois que o problema de acesso ao /admin for resolvido.
export async function GET() {
  const result: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    variaveis_de_ambiente: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEON_DATABASE_URL: !!process.env.NEON_DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    },
  };

  try {
    // import dinamico: se lib/db.ts falhar ja na inicializacao (ex:
    // nenhuma env var de banco configurada), isso e capturado aqui
    // em vez de derrubar a rota inteira com erro 500 sem explicacao.
    const { db } = await import("@/lib/db");
    const { sql } = await import("drizzle-orm");
    await db.execute(sql`select 1`);
    result.banco_de_dados = "conectado";
  } catch (error) {
    result.banco_de_dados = "falhou";
    result.erro = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(result);
}
