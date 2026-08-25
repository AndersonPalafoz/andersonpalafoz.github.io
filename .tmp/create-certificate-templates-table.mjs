import postgres from "postgres";

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não configurada");
const sql = postgres(connectionString, { prepare: false, max: 1 });
try {
  await sql`
    CREATE TABLE IF NOT EXISTS certificate_templates (
      id SERIAL PRIMARY KEY,
      name VARCHAR(180) NOT NULL,
      category VARCHAR(50) NOT NULL DEFAULT 'internal',
      institution VARCHAR(120),
      "isDefault" BOOLEAN NOT NULL DEFAULT FALSE,
      "templateUrl" TEXT,
      "includeSiteBranding" BOOLEAN NOT NULL DEFAULT TRUE,
      "fieldMappings" TEXT,
      "createdBy" INTEGER REFERENCES users(id),
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log("CERTIFICATE_TEMPLATES_TABLE_READY");
} finally {
  await sql.end({ timeout: 2 });
}
