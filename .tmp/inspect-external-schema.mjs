import postgres from "postgres";

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("DSN ausente");
const sql = postgres(connectionString, { prepare: false, max: 1 });
try {
  const rows = await sql`
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN ('external_classes','external_students','external_class_attendance','external_class_grades','external_class_materials','users')
    ORDER BY table_name, ordinal_position
  `;
  console.log(JSON.stringify(rows, null, 2));
} finally {
  await sql.end({ timeout: 5 });
}
