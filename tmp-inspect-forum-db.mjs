import postgres from "postgres";

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString?.startsWith("postgres")) throw new Error("PostgreSQL connection unavailable");
const sql = postgres(connectionString, { prepare: false });
try {
  const migrations = await sql`select id, hash, created_at from drizzle.__drizzle_migrations order by created_at desc limit 8`;
  const tables = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ('forum_posts', 'forum_replies', 'forum_post_likes')
    order by table_name
  `;
  const columns = await sql`
    select table_name, column_name, data_type
    from information_schema.columns
    where table_schema = 'public'
      and table_name in ('forum_posts', 'forum_replies', 'forum_post_likes')
    order by table_name, ordinal_position
  `;
  console.log(JSON.stringify({ migrations, tables, columns }, null, 2));
} finally {
  await sql.end({ timeout: 5 });
}
