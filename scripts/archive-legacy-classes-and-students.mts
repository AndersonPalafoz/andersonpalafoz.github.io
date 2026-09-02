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
  const [countsResult, classIssuesResult, studentIssuesResult] = await Promise.all([
    db.execute(sql`
      SELECT
        (SELECT COUNT(*) FROM external_classes)::int AS classes,
        (SELECT COUNT(*) FROM external_students)::int AS students,
        (SELECT COUNT(*) FROM external_class_teacher_assignments)::int AS teacher_assignments,
        0::int AS archived_classes,
        0::int AS archived_students,
        0::int AS archived_teacher_assignments
      LIMIT 1
    `),
    db.execute(sql`
      SELECT COUNT(*)::int AS total
      FROM external_classes c
      WHERE NOT EXISTS (
        SELECT 1 FROM course_offers o
        WHERE o."sourceExternalClassId" = c.id
          AND o.deleted_at IS NULL
      )
      LIMIT 1
    `),
    db.execute(sql`
      SELECT COUNT(*)::int AS total
      FROM external_students s
      WHERE NOT EXISTS (
        SELECT 1
        FROM course_offer_students cos
        JOIN course_offers o ON o.id = cos."offerId" AND o.deleted_at IS NULL
        WHERE cos."externalStudentId" = s.id
          AND o."sourceExternalClassId" = s."externalClassId"
      )
      LIMIT 1
    `),
  ]);

  const counts = countsResult[0] as Record<string, unknown> | undefined;
  const classIssues = numberValue(classIssuesResult[0] as Record<string, unknown> | undefined, "total");
  const studentIssues = numberValue(studentIssuesResult[0] as Record<string, unknown> | undefined, "total");
  const result = {
    generatedAt: new Date().toISOString(),
    mode: apply ? "apply" : "dry-run",
    status: classIssues || studentIssues ? "blocked" : "ready",
    counts: {
      classes: numberValue(counts, "classes"),
      students: numberValue(counts, "students"),
      teacherAssignments: numberValue(counts, "teacher_assignments"),
      archivedClasses: numberValue(counts, "archived_classes"),
      archivedStudents: numberValue(counts, "archived_students"),
      archivedTeacherAssignments: numberValue(counts, "archived_teacher_assignments"),
      classIssues,
      studentIssues,
    },
    destructive: false,
    archiveTables: [
      "legacy_external_classes_archive",
      "legacy_external_students_archive",
      "legacy_external_class_teacher_assignments_archive",
    ],
  };

  if (classIssues || studentIssues) {
    console.error(JSON.stringify(result, null, 2));
    process.exitCode = 1;
    return;
  }

  if (apply) {
    await db.transaction(async (tx) => {
      await tx.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS legacy_external_classes_archive AS
        SELECT c.*, NULL::integer AS "sourceOfferId", NOW()::timestamp AS "archivedAt", 'pre-decommission'::text AS "archiveReason"
        FROM external_classes c
        WHERE false
      `));
      await tx.execute(sql.raw(`
        ALTER TABLE legacy_external_classes_archive
          ADD COLUMN IF NOT EXISTS "sourceOfferId" integer,
          ADD COLUMN IF NOT EXISTS "archivedAt" timestamp NOT NULL DEFAULT NOW(),
          ADD COLUMN IF NOT EXISTS "archiveReason" text NOT NULL DEFAULT 'pre-decommission'
      `));
      await tx.execute(sql.raw(`
        CREATE UNIQUE INDEX IF NOT EXISTS legacy_external_classes_archive_source_idx
        ON legacy_external_classes_archive (id)
      `));
      await tx.execute(sql.raw(`
        INSERT INTO legacy_external_classes_archive
        SELECT c.*, (SELECT MIN(o.id) FROM course_offers o WHERE o."sourceExternalClassId" = c.id AND o.deleted_at IS NULL), NOW()::timestamp, 'pre-decommission'
        FROM external_classes c
        WHERE NOT EXISTS (SELECT 1 FROM legacy_external_classes_archive a WHERE a.id = c.id)
      `));

      await tx.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS legacy_external_students_archive AS
        SELECT s.*, NULL::integer AS "sourceOfferId", NOW()::timestamp AS "archivedAt", 'pre-decommission'::text AS "archiveReason"
        FROM external_students s
        WHERE false
      `));
      await tx.execute(sql.raw(`
        ALTER TABLE legacy_external_students_archive
          ADD COLUMN IF NOT EXISTS "sourceOfferId" integer,
          ADD COLUMN IF NOT EXISTS "archivedAt" timestamp NOT NULL DEFAULT NOW(),
          ADD COLUMN IF NOT EXISTS "archiveReason" text NOT NULL DEFAULT 'pre-decommission'
      `));
      await tx.execute(sql.raw(`
        CREATE UNIQUE INDEX IF NOT EXISTS legacy_external_students_archive_source_idx
        ON legacy_external_students_archive (id)
      `));
      await tx.execute(sql.raw(`
        INSERT INTO legacy_external_students_archive
        SELECT s.*, (SELECT MIN(cos."offerId") FROM course_offer_students cos JOIN course_offers o ON o.id = cos."offerId" AND o."sourceExternalClassId" = s."externalClassId" WHERE cos."externalStudentId" = s.id), NOW()::timestamp, 'pre-decommission'
        FROM external_students s
        WHERE NOT EXISTS (SELECT 1 FROM legacy_external_students_archive a WHERE a.id = s.id)
      `));

      await tx.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS legacy_external_class_teacher_assignments_archive AS
        SELECT a.*, NOW()::timestamp AS "archivedAt", 'pre-decommission'::text AS "archiveReason"
        FROM external_class_teacher_assignments a
        WHERE false
      `));
      await tx.execute(sql.raw(`
        ALTER TABLE legacy_external_class_teacher_assignments_archive
          ADD COLUMN IF NOT EXISTS "archivedAt" timestamp NOT NULL DEFAULT NOW(),
          ADD COLUMN IF NOT EXISTS "archiveReason" text NOT NULL DEFAULT 'pre-decommission'
      `));
      await tx.execute(sql.raw(`
        CREATE UNIQUE INDEX IF NOT EXISTS legacy_external_class_teacher_assignments_archive_source_idx
        ON legacy_external_class_teacher_assignments_archive (id)
      `));
      await tx.execute(sql.raw(`
        INSERT INTO legacy_external_class_teacher_assignments_archive
        SELECT a.*, NOW()::timestamp, 'pre-decommission'
        FROM external_class_teacher_assignments a
        WHERE NOT EXISTS (SELECT 1 FROM legacy_external_class_teacher_assignments_archive archived WHERE archived.id = a.id)
      `));
    });
    result.status = "archived";
    result.counts.archivedClasses = result.counts.classes;
    result.counts.archivedStudents = result.counts.students;
    result.counts.archivedTeacherAssignments = result.counts.teacherAssignments;
  }

  if (jsonOnly) console.log(JSON.stringify(result));
  else {
    console.log(`Arquivamento de turmas e alunos legados: ${result.status}`);
    console.log(JSON.stringify(result, null, 2));
  }
}

archive().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
