import { and, eq, isNull } from "drizzle-orm";
import {
  courseOfferStudents,
  courseOffers,
  externalClasses,
  externalStudents,
} from "@/drizzle/schema";
import { db } from "@/lib/db";
import {
  studentOfferMigrationDecision,
  summarizeStudentOfferMigration,
  type StudentOfferMigrationPlan,
} from "@/lib/course-offer-student-migration";

const apply = process.argv.includes("--apply");
const includeInactive = process.argv.includes("--include-inactive");
const classIdArgument = process.argv.find((value) => value.startsWith("--class-id="));
const offerIdArgument = process.argv.find((value) => value.startsWith("--offer-id="));
const classId = classIdArgument ? Number(classIdArgument.split("=")[1]) : null;
const offerId = offerIdArgument ? Number(offerIdArgument.split("=")[1]) : null;

function validPositiveInteger(value: number | null): value is number {
  return Number.isInteger(value) && value > 0;
}

function print(value: unknown) {
  console.log(JSON.stringify(value));
}

async function migrateClass(
  legacyClass: typeof externalClasses.$inferSelect,
  dryRun: boolean,
): Promise<StudentOfferMigrationPlan[]> {
  const students = await db.query.externalStudents.findMany({
    where: eq(externalStudents.externalClassId, legacyClass.id),
    orderBy: (table, { asc }) => asc(table.id),
  });
  const offers = await db.query.courseOffers.findMany({
    where: and(eq(courseOffers.sourceExternalClassId, legacyClass.id), isNull(courseOffers.deletedAt)),
    orderBy: (table, { asc }) => asc(table.id),
  });

  if (offers.length > 1) {
    const plans = students
      .filter((student) => includeInactive || student.status === "active")
      .map((student) => ({
        externalClassId: legacyClass.id,
        offerId: null,
        externalStudentId: student.id,
        studentName: student.name,
        decision: "missing-offer" as const,
        reason: `múltiplas ofertas ativas encontradas para a turma: ${offers.map((offer) => offer.id).join(", ")}`,
      }));
    print({ type: "class-warning", externalClassId: legacyClass.id, offerIds: offers.map((offer) => offer.id), reason: "ambiguous-active-offers" });
    return plans;
  }

  const offer = offers[0] ?? null;
  const plans: StudentOfferMigrationPlan[] = [];

  for (const externalStudent of students) {
    const existingByExternalId = offer
      ? await db.query.courseOfferStudents.findFirst({
          where: and(
            eq(courseOfferStudents.offerId, offer.id),
            eq(courseOfferStudents.externalStudentId, externalStudent.id),
          ),
          columns: { id: true, userId: true, externalStudentId: true },
        })
      : null;
    const existingByUserId = offer && externalStudent.userId
      ? await db.query.courseOfferStudents.findFirst({
          where: and(
            eq(courseOfferStudents.offerId, offer.id),
            eq(courseOfferStudents.userId, externalStudent.userId),
          ),
          columns: { id: true, userId: true, externalStudentId: true },
        })
      : null;

    const plan = studentOfferMigrationDecision({
      externalClassId: legacyClass.id,
      externalStudent,
      offerId: offer?.id ?? null,
      existingByExternalId,
      existingByUserId,
      includeInactive,
    });
    plans.push(plan);

    if (dryRun || plan.decision !== "insert" || !offer) continue;

    await db.insert(courseOfferStudents).values({
      offerId: offer.id,
      userId: externalStudent.userId,
      externalStudentId: externalStudent.id,
      name: externalStudent.name,
      socialName: externalStudent.socialName,
      email: externalStudent.email,
      studentIdNumber: externalStudent.studentIdNumber,
      status: externalStudent.status,
      notes: externalStudent.notes,
    }).onConflictDoNothing();
  }

  return plans;
}

async function main() {
  if (classIdArgument && !validPositiveInteger(classId)) throw new Error("--class-id deve ser um inteiro positivo");
  if (offerIdArgument && !validPositiveInteger(offerId)) throw new Error("--offer-id deve ser um inteiro positivo");

  const legacyClasses = await db.query.externalClasses.findMany({
    where: validPositiveInteger(classId) ? eq(externalClasses.id, classId) : isNull(externalClasses.deletedAt),
    orderBy: (table, { asc }) => asc(table.id),
  });

  let selectedClasses = legacyClasses;
  if (offerId) {
    const selectedOffer = await db.query.courseOffers.findFirst({
      where: and(eq(courseOffers.id, offerId), isNull(courseOffers.deletedAt)),
      columns: { id: true, sourceExternalClassId: true },
    });
    if (!selectedOffer) throw new Error(`Oferta ${offerId} não encontrada ou arquivada`);
    if (!selectedOffer.sourceExternalClassId) {
      throw new Error(`Oferta ${offerId} não possui sourceExternalClassId; não é possível inferir a turma legada`);
    }
    selectedClasses = legacyClasses.filter((legacyClass) => legacyClass.id === selectedOffer.sourceExternalClassId);
    if (selectedClasses.length === 0) {
      throw new Error(`A oferta ${offerId} aponta para a turma legada ${selectedOffer.sourceExternalClassId}, mas ela não está disponível para migração`);
    }
  }
  const allPlans: StudentOfferMigrationPlan[] = [];

  for (const legacyClass of selectedClasses) {
    const plans = await migrateClass(legacyClass, !apply);
    allPlans.push(...plans);
  }

  print({
    message: apply ? "Migração de alunos externos concluída." : "Prévia concluída; nenhuma gravação foi feita.",
    apply,
    includeInactive,
    classId,
    offerId,
    classCount: selectedClasses.length,
    studentCount: allPlans.length,
    summary: summarizeStudentOfferMigration(allPlans),
    plans: allPlans,
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
