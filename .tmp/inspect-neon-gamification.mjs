import postgres from "postgres";

const connectionString = process.env.NEON_DATABASE_URL;
if (!connectionString) throw new Error("NEON_DATABASE_URL ausente");
const sql = postgres(connectionString, { prepare: false, max: 1 });
try {
  const rows = await sql`
    SELECT
      to_regclass('public.user_gamification_points') AS gamification_table,
      to_regclass('public.user_medals') AS user_medals_table,
      to_regclass('public.medals_catalog') AS medals_catalog_table,
      to_regclass('public.notifications') AS notifications_table,
      to_regclass('public.event_logs') AS event_logs_table
  `;
  console.log(JSON.stringify(rows, null, 2));
} finally {
  await sql.end({ timeout: 2 });
}
