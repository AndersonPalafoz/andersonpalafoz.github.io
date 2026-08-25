import postgres from "postgres";

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não configurada");
const sql = postgres(connectionString, { prepare: false, max: 1 });
try {
  const columns = await sql`
    SELECT column_name, data_type, udt_name, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'courses'
    ORDER BY ordinal_position
  `;
  console.log(JSON.stringify(columns, null, 2));
} finally {
  await sql.end({ timeout: 2 });
}
