import postgres from "postgres";

const sql = postgres(process.env.NEON_DATABASE_URL, { prepare: false });
try {
  await sql`
    CREATE TABLE IF NOT EXISTS medals_catalog (
      id SERIAL PRIMARY KEY,
      code VARCHAR(64) NOT NULL UNIQUE,
      title VARCHAR(120) NOT NULL,
      description TEXT NOT NULL,
      icon VARCHAR(32) NOT NULL,
      category VARCHAR(64) NOT NULL,
      requirement TEXT NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_medals (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      "medalCode" VARCHAR(64) NOT NULL,
      "awardedBy" INTEGER REFERENCES users(id),
      "grantType" VARCHAR(32) NOT NULL DEFAULT 'automatic',
      notes TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_notifications (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(64) NOT NULL DEFAULT 'system',
      "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
      metadata TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name IN ('medals_catalog', 'user_medals', 'user_notifications')
    ORDER BY table_name
  `;
  console.log(JSON.stringify({ success: true, tables: tables.map((row) => row.table_name) }));
} finally {
  await sql.end({ timeout: 5 });
}
