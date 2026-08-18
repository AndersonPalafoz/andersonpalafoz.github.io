import postgres from "postgres";

const connectionString = process.env.NEON_DATABASE_URL;
if (!connectionString?.startsWith("postgres://") && !connectionString?.startsWith("postgresql://")) {
  throw new Error("NEON_DATABASE_URL PostgreSQL is required");
}

const sql = postgres(connectionString, { prepare: false });

try {
  await sql.begin(async (transaction) => {
    await transaction`
      DO $$
      BEGIN
        CREATE TYPE "public"."forum_post_status" AS ENUM ('pending', 'approved', 'rejected', 'resolved');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END
      $$;
    `;

    await transaction`
      CREATE TABLE IF NOT EXISTS "public"."forum_posts" (
        "id" serial PRIMARY KEY NOT NULL,
        "authorId" integer NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
        "title" varchar(200) NOT NULL,
        "category" varchar(80) NOT NULL,
        "content" text NOT NULL,
        "audioUrl" varchar(1000),
        "status" "public"."forum_post_status" NOT NULL DEFAULT 'pending',
        "moderationNote" text,
        "moderatedBy" integer REFERENCES "public"."users"("id"),
        "moderatedAt" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      );
    `;

    await transaction`
      CREATE TABLE IF NOT EXISTS "public"."forum_replies" (
        "id" serial PRIMARY KEY NOT NULL,
        "postId" integer NOT NULL REFERENCES "public"."forum_posts"("id") ON DELETE CASCADE,
        "authorId" integer NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
        "content" text NOT NULL,
        "audioUrl" varchar(1000),
        "isResolved" boolean NOT NULL DEFAULT false,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      );
    `;

    await transaction`
      CREATE TABLE IF NOT EXISTS "public"."forum_post_likes" (
        "id" serial PRIMARY KEY NOT NULL,
        "postId" integer NOT NULL REFERENCES "public"."forum_posts"("id") ON DELETE CASCADE,
        "userId" integer NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
        "createdAt" timestamp NOT NULL DEFAULT now()
      );
    `;

    await transaction`CREATE UNIQUE INDEX IF NOT EXISTS "forum_post_likes_post_user_idx" ON "public"."forum_post_likes" ("postId", "userId");`;
    await transaction`CREATE INDEX IF NOT EXISTS "forum_posts_status_created_idx" ON "public"."forum_posts" ("status", "createdAt");`;
    await transaction`CREATE INDEX IF NOT EXISTS "forum_posts_category_created_idx" ON "public"."forum_posts" ("category", "createdAt");`;
    await transaction`CREATE INDEX IF NOT EXISTS "forum_replies_post_created_idx" ON "public"."forum_replies" ("postId", "createdAt");`;
  });

  console.log("Forum schema ensured in PostgreSQL without destructive operations.");
} finally {
  await sql.end({ timeout: 5 });
}
