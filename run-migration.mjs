import postgres from "postgres";
import * as dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("No database connection string found.");
  process.exit(1);
}

const sql = postgres(connectionString);

async function main() {
  try {
    console.log("Applying multimedia and governance schema updates...");

    await sql`
      DO $$ BEGIN
        CREATE TYPE modality AS ENUM ('individual', 'group', 'hybrid');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE session_status AS ENUM ('scheduled', 'completed', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE event_type AS ENUM ('login', 'material_submission', 'activity_complete', 'course_enroll', 'role_change');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS class_sessions (
        id SERIAL PRIMARY KEY,
        "courseId" INTEGER REFERENCES courses(id),
        "teacherId" INTEGER NOT NULL REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        modality modality NOT NULL DEFAULT 'individual',
        "scheduledAt" TIMESTAMP NOT NULL,
        "durationMinutes" INTEGER DEFAULT 60,
        status session_status NOT NULL DEFAULT 'scheduled',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS attendances (
        id SERIAL PRIMARY KEY,
        "sessionId" INTEGER NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
        "studentId" INTEGER NOT NULL REFERENCES users(id),
        present BOOLEAN NOT NULL DEFAULT TRUE,
        notes TEXT,
        "recordedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS event_logs (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER REFERENCES users(id),
        "userEmail" VARCHAR(320),
        "eventType" event_type NOT NULL,
        details TEXT,
        "ipAddress" VARCHAR(64),
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Add columns safely
    const tables = ['courses', 'materials', 'articles', 'lessons', 'activities'];
    for (const table of tables) {
      try { await sql`ALTER TABLE ${sql(table)} ADD COLUMN IF NOT EXISTS "audioUrl" VARCHAR(500);`; } catch (e) {}
      try { await sql`ALTER TABLE ${sql(table)} ADD COLUMN IF NOT EXISTS "videoUrl" VARCHAR(500);`; } catch (e) {}
      try { await sql`ALTER TABLE ${sql(table)} ADD COLUMN IF NOT EXISTS "imageUrl" VARCHAR(500);`; } catch (e) {}
    }

    try { await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS modality modality DEFAULT 'individual';`; } catch (e) {}
    try { await sql`ALTER TABLE materials ADD COLUMN IF NOT EXISTS "mediaType" VARCHAR(32) DEFAULT 'document';`; } catch (e) {}
    try { await sql`ALTER TABLE materials ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN DEFAULT TRUE NOT NULL;`; } catch (e) {}
    try { await sql`ALTER TABLE materials ADD COLUMN IF NOT EXISTS "courseId" INTEGER;`; } catch (e) {}
    try { await sql`ALTER TABLE materials ADD COLUMN IF NOT EXISTS "lessonId" INTEGER;`; } catch (e) {}
    try { await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;`; } catch (e) {}
    try { await sql`ALTER TABLE materials ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;`; } catch (e) {}
    try { await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;`; } catch (e) {}
    try { await sql`ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP;`; } catch (e) {}
    try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS "teacherId" INTEGER;`; } catch (e) {}
    try { await sql`ALTER TABLE "userActivityProgress" ADD COLUMN IF NOT EXISTS "audioResponseUrl" VARCHAR(500);`; } catch (e) {}
    try { await sql`ALTER TABLE "userActivityProgress" ADD COLUMN IF NOT EXISTS "teacherFeedback" TEXT;`; } catch (e) {}
    try { await sql`ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'listening';`; } catch (e) {}

    console.log("Migration applied successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await sql.end();
  }
}

main();
