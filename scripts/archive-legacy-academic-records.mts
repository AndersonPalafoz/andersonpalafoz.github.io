import { sql } from "drizzle-orm";

const apply = process.argv.includes("--apply");
const jsonOnly = process.argv.includes("--json");

function numberValue(row: Record<string, unknown> | undefined, key: string) {
  return Number(row?.[key] ?? 0);
}

async function archive() {
  if (!process.env.NEON_DATABASE_URL && !process.env.DATABASE_URL) {
    console.log(JSON.stringify({ status: "skipped", reason: "NEON_DATABASE_URL ou DATABASE_URL não configurada" }));
    return;
  }

  const [{ db }] = await Promise.all([import("@/lib/db")]);
  const [countsResult, gradeIssuesResult, attendanceIssuesResult] = await Promise.all([
    db.execute(sql`
      SELECT
        (SELECT COUNT(*) FROM external_class_grades)::int AS grades,
        (SELECT COUNT(*) FROM external_class_attendance)::int AS attendance,
        0::int AS archived_grades,
        0::int AS archived_attendance
      LIMIT 1
    `),
    db.execute(sql`
      SELECT COUNT(*)::int AS total
      FROM external_class_grades g
      WHERE g."offerId" IS NULL
         OR g."courseOfferStudentId" IS NULL
         OR NOT EXISTS (
           SELECT 1 FROM course_offer_students cos
           WHERE cos.id = g."courseOfferStudentId"
             AND cos."offerId" = g."offerId"
         )
      LIMIT 1
    `),
    db.execute(sql`
      SELECT COUNT(*)::int AS total
      FROM external_class_attendance a
      WHERE a."offerId" IS NULL
         OR NOT EXISTS (
           SELECT 1 FROM course_offer_attendance coa
           WHERE coa."offerId" = a."offerId"
             AND coa.date = a.date
         )
      LIMIT 1
    `),
  ]);

  const counts = countsResult[0] as Record<string, unknown> | undefined;
  const gradeIssues = numberValue(gradeIssuesResult[0] as Record<string, unknown> | undefined, "total");
  const attendanceIssues = numberValue(attendanceIssuesResult[0] as Record<string, unknown> | undefined, "total");
  const result = {
    generatedAt: new Date().toISOString(),
    mode: apply ? "apply" : "dry-run",
    status: gradeIssues || attendanceIssues ? "blocked" : "ready",
    counts: {
      grades: numberValue(counts, "grades"),
      attendance: numberValue(counts, "attendance"),
      archivedGrades: numberValue(counts, "archived_grades"),
      archivedAttendance: numberValue(counts, "archived_attendance"),
      gradeIssues,
      attendanceIssues,
    },
    destructive: false,
    archiveTables: ["legacy_external_class_grades_archive", "legacy_external_class_attendance_archive"],
  };

  if (gradeIssues || attendanceIssues) {
    console.error(JSON.stringify(result, null, 2));
    process.exitCode = 1;
    return;
  }

  if (apply) {
    await db.transaction(async (tx) => {
      await tx.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS legacy_external_class_grades_archive AS
        SELECT g.*, NOW()::timestamp AS "archivedAt", 'pre-decommission'::text AS "archiveReason"
        FROM external_class_grades g
        WHERE false
      `));
      await tx.execute(sql.raw(`
        ALTER TABLE legacy_external_class_grades_archive
          ADD COLUMN IF NOT EXISTS "archivedAt" timestamp NOT NULL DEFAULT NOW(),
          ADD COLUMN IF NOT EXISTS "archiveReason" text NOT NULL DEFAULT 'pre-decommission'
      `));
      await tx.execute(sql.raw(`
        CREATE UNIQUE INDEX IF NOT EXISTS legacy_external_class_grades_archive_source_idx
        ON legacy_external_class_grades_archive (id)
      `));
      await tx.execute(sql.raw(`
        INSERT INTO legacy_external_class_grades_archive
        SELECT g.*, NOW()::timestamp, 'pre-decommission'
        FROM external_class_grades g
        WHERE NOT EXISTS (
          SELECT 1 FROM legacy_external_class_grades_archive a WHERE a.id = g.id
        )
      `));
      await tx.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS legacy_external_class_attendance_archive AS
        SELECT a.*, NOW()::timestamp AS "archivedAt", 'pre-decommission'::text AS "archiveReason"
        FROM external_class_attendance a
        WHERE false
      `));
      await tx.execute(sql.raw(`
        ALTER TABLE legacy_external_class_attendance_archive
          ADD COLUMN IF NOT EXISTS "archivedAt" timestamp NOT NULL DEFAULT NOW(),
          ADD COLUMN IF NOT EXISTS "archiveReason" text NOT NULL DEFAULT 'pre-decommission'
      `));
      await tx.execute(sql.raw(`
        CREATE UNIQUE INDEX IF NOT EXISTS legacy_external_class_attendance_archive_source_idx
        ON legacy_external_class_attendance_archive (id)
      `));
      await tx.execute(sql.raw(`
        INSERT INTO legacy_external_class_attendance_archive
        SELECT a.*, NOW()::timestamp, 'pre-decommission'
        FROM external_class_attendance a
        WHERE NOT EXISTS (
          SELECT 1 FROM legacy_external_class_attendance_archive archived WHERE archived.id = a.id
        )
      `));
    });
    result.status = "archived";
    result.counts.archivedGrades = result.counts.grades;
    result.counts.archivedAttendance = result.counts.attendance;
  }

  if (jsonOnly) console.log(JSON.stringify(result));
  else {
    console.log(`Arquivamento acadêmico legado: ${result.status}`);
    console.log(JSON.stringify(result, null, 2));
  }
}

archive().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
