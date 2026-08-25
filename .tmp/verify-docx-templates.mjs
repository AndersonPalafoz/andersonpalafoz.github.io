import postgres from "postgres";
const url = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL ausente");
const sql = postgres(url, { prepare: false, max: 1 });
try {
  const rows = await sql`SELECT id, name, category, institution, "templateUrl", "includeSiteBranding" FROM certificate_templates WHERE name IN ('Modelo Oficial IsF / UFBA 2025', 'Modelo Oficial PROFICI / UFBA', 'Modelo Institucional de Curso Livre') ORDER BY id ASC LIMIT 10`;
  console.log(JSON.stringify(rows, null, 2));
} finally { await sql.end({ timeout: 2 }); }
