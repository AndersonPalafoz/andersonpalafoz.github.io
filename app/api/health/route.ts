import { NextResponse } from "next/server";

// Endpoint de diagnostico TEMPORARIO -- so reporta se as variaveis de
// ambiente criticas estao configuradas (true/false, nunca o valor) e
// se a conexao com o banco funciona. Nunca expoe usuario/senha.
// Remover depois que o problema de acesso ao /admin for resolvido.

function sanitizarConexao(raw: string | undefined) {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return {
      protocolo: url.protocol.replace(":", ""),
      host: url.hostname,
      porta: url.port || "(padrão)",
      banco: url.pathname.replace("/", "") || "(vazio)",
      tem_usuario: !!url.username,
      tem_senha: !!url.password,
      parametros: url.search || "(nenhum)",
    };
  } catch {
    return { erro: "não foi possível interpretar o formato da string de conexão" };
  }
}

export async function GET() {
  const usadaDatabaseUrl = !!process.env.DATABASE_URL;
  const connectionStringUsada = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

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
    conexao_que_esta_sendo_usada: usadaDatabaseUrl ? "DATABASE_URL" : "NEON_DATABASE_URL",
    detalhes_da_conexao_sem_senha: sanitizarConexao(connectionStringUsada),
  };

  try {
    // import dinamico: se lib/db.ts falhar ja na inicializacao (ex:
    // nenhuma env var de banco configurada), isso e capturado aqui
    // em vez de derrubar a rota inteira com erro 500 sem explicacao.
    const { db } = await import("@/lib/db");
    const { sql } = await import("drizzle-orm");
    await db.execute(sql`select 1`);
    result.banco_de_dados = "conectado";

    // Verifica se as tabelas existem e quantas linhas cada uma tem --
    // um banco novo/trocado pode estar conectado mas ainda sem o
    // schema criado (migrations nunca aplicadas nele) ou vazio.
    const tabelas = ["users", "courses", "materials", "articles", "modules", "lessons", "enrollments"];
    const contagens: Record<string, string> = {};
    for (const tabela of tabelas) {
      try {
        const linhas = await db.execute(sql.raw(`select count(*) as total from "${tabela}"`));
        const total = (linhas as unknown as Array<{ total: string }>)[0]?.total ?? "?";
        contagens[tabela] = total;
      } catch {
        contagens[tabela] = "tabela não existe";
      }
    }
    result.tabelas = contagens;
  } catch (error) {
    result.banco_de_dados = "falhou";
    result.erro = error instanceof Error ? error.message : String(error);
    if (error instanceof Error && "cause" in error && error.cause) {
      result.erro_causa = String(error.cause);
    }
  }

  return NextResponse.json(result);
}
