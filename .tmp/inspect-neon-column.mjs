import postgres from "postgres";
const sql = postgres(process.env.NEON_DATABASE_URL, { prepare: false, max: 1 });
try {
  const rows = await sql`
    SELECT column_default, is_nullable, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_gamification_points'
      AND column_name = 'streakDays'
  `;
  console.log(JSON.stringify(rows, null, 2));
} finally {
  await sql.end({ timeout: 2 });
}
