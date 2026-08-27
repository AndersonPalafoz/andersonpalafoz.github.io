import { eq, isNull } from "drizzle-orm";
import {
  auditCourseOfferConsistency,
  summarizeConsistency,
  type CourseOfferSnapshot,
  type LegacyClassSnapshot,
} from "@/lib/course-offer-consistency";

const args = new Set(process.argv.slice(2));
const classIdArg = process.argv.find((arg) => arg.startsWith("--class-id="));
const classId = classIdArg ? Number(classIdArg.split("=")[1]) : null;
const jsonOnly = args.has("--json");
const failOnWarning = args.has("--fail-on-warning");

if (classId !== null && (!Number.isInteger(classId) || classId <= 0)) {
  console.error("--class-id deve ser um inteiro positivo.");
  process.exit(2);
}

async function audit() {
  if (!process.env.NEON_DATABASE_URL && !process.env.DATABASE_URL) {
    const result = { status: "skipped", reason: "NEON_DATABASE_URL ou DATABASE_URL não configurada", classId };
    console.log(JSON.stringify(result));
    return;
  }
  const [{ db }, schema] = await Promise.all([
    import("@/lib/db"),
    import("@/drizzle/schema"),
  ]);
  const legacyClasses = await db.query.externalClasses.findMany({
    where: classId ? eq(schema.externalClasses.id, classId) : isNull(schema.externalClasses.deletedAt),
  });
  const allFindings = [] as ReturnType<typeof auditCourseOfferConsistency>[][number];
  const summaries: Array<{ externalClassId: number; offerId: number | null; summary: ReturnType<typeof summarizeConsistency> }> = [];

  for (const legacyClass of legacyClasses) {
    const legacyStudents = await db.query.externalStudents.findMany({ where: eq(schema.externalStudents.externalClassId, legacyClass.id) });
    const legacyAttendance = await db.query.externalClassAttendance.findMany({ where: eq(schema.externalClassAttendance.externalClassId, legacyClass.id) });
    const legacyAssignments = await db.query.externalClassTeacherAssignments.findMany({ where: eq(schema.externalClassTeacherAssignments.externalClassId, legacyClass.id) });
    const offers = await db.query.courseOffers.findMany({ where: eq(schema.courseOffers.sourceExternalClassId, legacyClass.id) });
    const activeOffer = offers.find((offer) => !offer.deletedAt) ?? null;
    const duplicateFindings = offers.length > 1 ? [{ code: "DUPLICATE_SOURCE_OFFERS", severity: "error" as const, externalClassId: legacyClass.id, offerId: activeOffer?.id, message: "Há mais de uma oferta vinculada à mesma turma legada.", details: { offerIds: offers.map((offer) => offer.id) } }] : [];
    const offer: CourseOfferSnapshot | null = activeOffer ? {
      id: activeOffer.id,
      courseId: activeOffer.courseId,
      offerName: activeOffer.offerName,
      academicTerm: activeOffer.academicTerm,
      ownerTeacherId: activeOffer.ownerTeacherId,
      sourceExternalClassId: activeOffer.sourceExternalClassId,
      students: await db.query.courseOfferStudents.findMany({ where: eq(schema.courseOfferStudents.offerId, activeOffer.id) }),
      attendance: await db.query.courseOfferAttendance.findMany({ where: eq(schema.courseOfferAttendance.offerId, activeOffer.id) }),
      teacherIds: (await db.query.courseOfferTeacherAssignments.findMany({ where: eq(schema.courseOfferTeacherAssignments.offerId, activeOffer.id) })).map((assignment) => assignment.teacherId),
    } : null;
    const legacy: LegacyClassSnapshot = {
      id: legacyClass.id,
      courseName: legacyClass.courseName,
      academicTerm: legacyClass.academicTerm,
      teacherId: legacyClass.teacherId,
      studentIds: legacyStudents,
      attendance: legacyAttendance,
      assignmentTeacherIds: legacyAssignments.map((assignment) => assignment.teacherId),
    };
    const findings = [...duplicateFindings, ...auditCourseOfferConsistency(legacy, offer)];
    allFindings.push(...findings);
    summaries.push({ externalClassId: legacyClass.id, offerId: activeOffer?.id ?? null, summary: summarizeConsistency(findings) });
  }
  const summary = summarizeConsistency(allFindings);
  const result = { generatedAt: new Date().toISOString(), classId, classes: summaries, summary, findings: allFindings };
  if (jsonOnly) console.log(JSON.stringify(result));
  else {
    console.log(`Auditoria de consistência: ${summary.ok ? "OK" : "DIVERGÊNCIAS ENCONTRADAS"}`);
    console.log(`Turmas: ${summaries.length} | Erros: ${summary.errors} | Avisos: ${summary.warnings}`);
    for (const finding of allFindings) console.log(`[${finding.severity.toUpperCase()}] ${finding.code} — turma ${finding.externalClassId}${finding.offerId ? ` / oferta ${finding.offerId}` : ""}: ${finding.message}`);
    console.log(JSON.stringify({ generatedAt: result.generatedAt, classId, summary }, null, 2));
  }
  if (summary.errors > 0 || (failOnWarning && summary.warnings > 0)) process.exitCode = 1;
}

audit().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
