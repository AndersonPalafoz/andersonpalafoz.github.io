import { sql } from "drizzle-orm";

const args = new Set(process.argv.slice(2));
const jsonOnly = args.has("--json");
const failOnWarning = args.has("--fail-on-warning");

function numberValue(row: Record<string, unknown> | undefined, key: string): number {
  return Number(row?.[key] ?? 0);
}

async function audit() {
  if (!process.env.NEON_DATABASE_URL && !process.env.DATABASE_URL) {
    console.log(JSON.stringify({ status: "skipped", reason: "NEON_DATABASE_URL ou DATABASE_URL não configurada" }));
    return;
  }

  const [{ db }] = await Promise.all([import("@/lib/db")]);
  const [
    legacyClassesResult,
    legacyStudentsResult,
    gradesResult,
    attendanceResult,
    materialsResult,
    offersResult,
    offerStudentsResult,
    missingOffersResult,
    missingStudentsResult,
    fksResult,
    placeholdersResult,
  ] = await Promise.all([
    db.execute(sql`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE deleted_at IS NULL)::int AS active FROM external_classes LIMIT 1`),
    db.execute(sql`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'active')::int AS active FROM external_students LIMIT 1`),
    db.execute(sql`SELECT COUNT(*)::int AS total FROM external_class_grades LIMIT 1`),
    db.execute(sql`SELECT COUNT(*)::int AS total FROM external_class_attendance LIMIT 1`),
    db.execute(sql`SELECT COUNT(*)::int AS total FROM external_class_materials LIMIT 1`),
    db.execute(sql`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE "sourceExternalClassId" IS NOT NULL)::int AS linked_legacy_classes FROM course_offers WHERE deleted_at IS NULL LIMIT 1`),
    db.execute(sql`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE "externalStudentId" IS NOT NULL)::int AS linked_legacy_students FROM course_offer_students LIMIT 1`),
    db.execute(sql`SELECT COUNT(*)::int AS total FROM external_classes ec WHERE ec.deleted_at IS NULL AND NOT EXISTS (SELECT 1 FROM course_offers co WHERE co."sourceExternalClassId" = ec.id AND co.deleted_at IS NULL) LIMIT 1`),
    db.execute(sql`SELECT COUNT(*)::int AS total FROM external_students es WHERE es.status = 'active' AND NOT EXISTS (SELECT 1 FROM course_offer_students cos WHERE cos."externalStudentId" = es.id) LIMIT 1`),
    db.execute(sql`SELECT conrelid::regclass::text AS referencing_table, a.attname AS referencing_column, confrelid::regclass::text AS referenced_table, af.attname AS referenced_column, con.confdeltype FROM pg_constraint con JOIN LATERAL unnest(con.conkey) WITH ORDINALITY AS ck(attnum, ord) ON true JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = ck.attnum JOIN LATERAL unnest(con.confkey) WITH ORDINALITY AS fk(attnum, ord) ON fk.ord = ck.ord JOIN pg_attribute af ON af.attrelid = con.confrelid AND af.attnum = fk.attnum JOIN pg_class referenced_class ON referenced_class.oid = con.confrelid WHERE con.contype = 'f' AND referenced_class.relname IN ('external_students', 'external_classes') ORDER BY 1, 2 LIMIT 100`),
    db.execute(sql`SELECT COUNT(*)::int AS total FROM external_students WHERE lower(COALESCE(email, '')) LIKE '%placeholder%' OR lower(COALESCE(email, '')) LIKE '%external.%' OR lower(COALESCE(name, '')) ~ '(teste|test|placeholder)' LIMIT 1`),
  ]);

  const legacyClasses = legacyClassesResult[0] as Record<string, unknown> | undefined;
  const legacyStudents = legacyStudentsResult[0] as Record<string, unknown> | undefined;
  const grades = gradesResult[0] as Record<string, unknown> | undefined;
  const attendance = attendanceResult[0] as Record<string, unknown> | undefined;
  const materials = materialsResult[0] as Record<string, unknown> | undefined;
  const offers = offersResult[0] as Record<string, unknown> | undefined;
  const offerStudents = offerStudentsResult[0] as Record<string, unknown> | undefined;
  const missingOffers = numberValue(missingOffersResult[0] as Record<string, unknown> | undefined, "total");
  const missingStudents = numberValue(missingStudentsResult[0] as Record<string, unknown> | undefined, "total");
  const foreignKeys = (fksResult as unknown as Record<string, unknown>[]).map((row) => ({
    referencingTable: row.referencing_table,
    referencingColumn: row.referencing_column,
    referencedTable: row.referenced_table,
    referencedColumn: row.referenced_column,
    onDelete: row.confdeltype,
  }));
  const placeholders = numberValue(placeholdersResult[0] as Record<string, unknown> | undefined, "total");

  const errors: string[] = [];
  const warnings: string[] = [];
  if (missingOffers > 0) errors.push(`${missingOffers} turma(s) legada(s) ativa(s) sem oferta ativa`);
  if (missingStudents > 0) errors.push(`${missingStudents} aluno(s) legado(s) ativo(s) sem matrícula contextual`);
  if (foreignKeys.length > 0) errors.push(`${foreignKeys.length} foreign key(s) ainda referenciam tabelas legadas`);
  if (numberValue(grades, "total") > 0) errors.push(`${numberValue(grades, "total")} nota(s) legada(s) ainda não migrada(s)`);
  if (numberValue(attendance, "total") > 0) warnings.push(`${numberValue(attendance, "total")} frequência(s) legada(s) preservada(s) para reconciliação`);
  if (numberValue(materials, "total") > 0) errors.push(`${numberValue(materials, "total")} material(is) legado(s) ainda não migrado(s)`);
  if (numberValue(legacyClasses, "active") > 0) warnings.push(`${numberValue(legacyClasses, "active")} turma(s) legada(s) ainda ativa(s)`);
  if (numberValue(legacyStudents, "active") > 0) warnings.push(`${numberValue(legacyStudents, "active")} aluno(s) legado(s) ativo(s) ainda preservado(s)`);
  if (placeholders > 0) errors.push(`${placeholders} registro(s) placeholder detectado(s) em alunos legados`);

  const result = {
    generatedAt: new Date().toISOString(),
    status: errors.length > 0 || (failOnWarning && warnings.length > 0) ? "blocked" : "ready-for-next-review",
    counts: {
      legacyClasses: { total: numberValue(legacyClasses, "total"), active: numberValue(legacyClasses, "active") },
      legacyStudents: { total: numberValue(legacyStudents, "total"), active: numberValue(legacyStudents, "active") },
      legacyGrades: numberValue(grades, "total"),
      legacyAttendance: numberValue(attendance, "total"),
      legacyMaterials: numberValue(materials, "total"),
      activeOffers: numberValue(offers, "total"),
      offersLinkedToLegacyClasses: numberValue(offers, "linked_legacy_classes"),
      contextualStudents: numberValue(offerStudents, "total"),
      contextualStudentsLinkedToLegacy: numberValue(offerStudents, "linked_legacy_students"),
      placeholders,
      missingOffers,
      missingStudents,
    },
    foreignKeys,
    errors,
    warnings,
    removalAllowed: false,
  };

  if (jsonOnly) console.log(JSON.stringify(result));
  else {
    console.log(`Auditoria de desativação legada: ${result.status}`);
    console.log(`Erros: ${errors.length} | Avisos: ${warnings.length}`);
    for (const error of errors) console.log(`[ERROR] ${error}`);
    for (const warning of warnings) console.log(`[WARN] ${warning}`);
    console.log(JSON.stringify(result, null, 2));
  }
  if (errors.length > 0 || (failOnWarning && warnings.length > 0)) process.exitCode = 1;
}

audit().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
