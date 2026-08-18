import postgres from "postgres";

const sql = postgres(process.env.NEON_DATABASE_URL, { prepare: false });
try {
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name IN ('forum_posts', 'forum_replies', 'forum_post_likes')
    ORDER BY table_name
  `;
  const indexes = await sql`
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public' AND indexname IN ('forum_post_likes_post_user_idx', 'forum_posts_status_created_idx', 'forum_posts_category_created_idx', 'forum_replies_post_created_idx')
    ORDER BY indexname
  `;
  console.log(JSON.stringify({ tables: tables.map((row) => row.table_name), indexes: indexes.map((row) => row.indexname) }));
} finally {
  await sql.end({ timeout: 5 });
}
