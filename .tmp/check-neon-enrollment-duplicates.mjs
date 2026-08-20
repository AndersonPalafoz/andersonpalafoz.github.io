import postgres from "postgres";

const connectionString = process.env.NEON_DATABASE_URL;
if (!connectionString) throw new Error("NEON_DATABASE_URL ausente");
const sql = postgres(connectionString, { max: 1, prepare: false });
try {
  const rows = await sql`
    SELECT "userId", "courseId", COUNT(*)::int AS duplicate_count
    FROM "enrollments"
    GROUP BY "userId", "courseId"
    HAVING COUNT(*) > 1
    ORDER BY duplicate_count DESC
    LIMIT 50
  `;
  console.log(JSON.stringify({ duplicateGroups: rows.length, rows }, null, 2));
} finally {
  await sql.end({ timeout: 5 });
}
