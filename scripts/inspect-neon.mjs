import postgres from "postgres";

const connectionString = process.env.NEON_DATABASE_URL;
if (!connectionString?.startsWith("postgres://") && !connectionString?.startsWith("postgresql://")) {
  throw new Error("NEON_DATABASE_URL is not a PostgreSQL URL");
}

const sql = postgres(connectionString, { prepare: false, max: 1, connect_timeout: 8 });
try {
  const migrations = await sql`
    select id, hash, created_at
    from drizzle.__drizzle_migrations
    order by id desc
    limit 20
  `;
  const usersColumns = await sql`
    select column_name, data_type
    from information_schema.columns
    where table_schema = 'public' and table_name = 'users'
    order by ordinal_position
    limit 40
  `;
  const tables = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ('courses', 'materials', 'articles', 'users', 'enrollments', 'activities', 'userActivityProgress', 'certificates', 'admin_audit_logs')
    order by table_name
    limit 20
  `;
  console.log(JSON.stringify({ migrations, usersColumns, tables }, null, 2));
} finally {
  await sql.end({ timeout: 5 });
}
