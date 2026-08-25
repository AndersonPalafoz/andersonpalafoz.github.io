import postgres from "postgres";
const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não configurada");
const sql = postgres(connectionString, { prepare: false, max: 1 });
try {
  const rows = await sql`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'certificate_templates'
    ORDER BY ordinal_position
  `;
  console.log(JSON.stringify(rows, null, 2));
} finally { await sql.end({ timeout: 2 }); }
