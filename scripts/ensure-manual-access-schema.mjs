import postgres from "postgres";

const sql = postgres(process.env.NEON_DATABASE_URL, { prepare: false });
try {
  await sql`
    CREATE TABLE IF NOT EXISTS manual_access_grants (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      "courseId" INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      "materialId" INTEGER REFERENCES materials(id) ON DELETE CASCADE,
      "grantedBy" INTEGER NOT NULL REFERENCES users(id),
      reason TEXT NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS manual_access_user_course_idx
    ON manual_access_grants("userId", "courseId")
    WHERE "courseId" IS NOT NULL
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS manual_access_user_material_idx
    ON manual_access_grants("userId", "materialId")
    WHERE "materialId" IS NOT NULL
  `;
  console.log(JSON.stringify({ success: true }));
} finally {
  await sql.end({ timeout: 5 });
}
