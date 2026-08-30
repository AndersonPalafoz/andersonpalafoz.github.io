import { and, eq, isNull } from "drizzle-orm";
import { calculateSimalComposite } from "@/lib/simal-grading";

const apply = process.argv.includes("--apply");
const classIdArgument = process.argv.find((value) => value.startsWith("--class-id="));
const classId = classIdArgument ? Number(classIdArgument.split("=")[1]) : null;

function validId(value: number | null): value is number {
  return Number.isInteger(value) && value > 0;
}

function print(value: unknown) {
  console.log(JSON.stringify(value));
}

async function main() {
  if (classIdArgument && !validId(classId)) throw new Error("--class-id deve ser um inteiro positivo");
  if (!process.env.NEON_DATABASE_URL && !process.env.DATABASE_URL) {
    print({ status: "skipped", reason: "NEON_DATABASE_URL ou DATABASE_URL não configurada", apply, classId });
    return;
  }

  const [{ db }, schema] = await Promise.all([import("@/lib/db"), import("@/drizzle/schema")]);
  const classes = await db.query.externalClasses.findMany({
    where: validId(classId) ? eq(schema.externalClasses.id, classId) : isNull(schema.externalClasses.deletedAt),
    orderBy: (table, { asc }) => asc(table.id),
  });
  const gradePlans: Array<Record<string, unknown>> = [];
  const simalGroups = new Map<string, Array<typeof schema.externalClassGrades.$inferSelect>>();

  for (const legacyClass of classes) {
    const [offers, students, grades] = await Promise.all([
      db.query.courseOffers.findMany({
        where: and(eq(schema.courseOffers.sourceExternalClassId, legacyClass.id), isNull(schema.courseOffers.deletedAt)),
      }),
      db.query.externalStudents.findMany({ where: eq(schema.externalStudents.externalClassId, legacyClass.id) }),
      db.query.externalClassGrades.findMany({ where: eq(schema.externalClassGrades.externalClassId, legacyClass.id) }),
    ]);
    const offer = offers.length === 1 ? offers[0] : null;

    for (const grade of grades) {
      const legacyStudent = students.find((student) => student.id === grade.studentId);
      const contextualStudent = offer && legacyStudent
        ? await db.query.courseOfferStudents.findFirst({
            where: and(
              eq(schema.courseOfferStudents.offerId, offer.id),
              eq(schema.courseOfferStudents.externalStudentId, legacyStudent.id),
            ),
          })
        : null;
      let decision: "already-contextualized" | "backfill" | "missing-offer" | "missing-student" | "conflict";
      let reason: string | undefined;
      if (offers.length !== 1) {
        decision = offers.length === 0 ? "missing-offer" : "conflict";
        reason = offers.length === 0 ? "não existe oferta ativa para a turma" : `existem ${offers.length} ofertas ativas para a turma`;
      } else if (!legacyStudent || !contextualStudent) {
        decision = "missing-student";
        reason = "não existe matrícula contextual correspondente ao aluno legado";
      } else if ((grade.offerId !== null && grade.offerId !== offer.id) || (grade.courseOfferStudentId !== null && grade.courseOfferStudentId !== contextualStudent.id)) {
        decision = "conflict";
        reason = "a nota já aponta para outro contexto acadêmico";
      } else if (grade.offerId === offer.id && grade.courseOfferStudentId === contextualStudent.id) {
        decision = "already-contextualized";
      } else {
        decision = "backfill";
      }

      gradePlans.push({
        gradeId: grade.id,
        externalClassId: legacyClass.id,
        externalStudentId: grade.studentId,
        offerId: offer?.id ?? null,
        courseOfferStudentId: contextualStudent?.id ?? null,
        assessmentTitle: grade.assessmentTitle,
        assessmentType: grade.assessmentType,
        assessmentComponent: grade.assessmentComponent,
        score: grade.score,
        maxScore: grade.maxScore,
        decision,
        ...(reason ? { reason } : {}),
      });

      if (offer && contextualStudent && decision !== "conflict" && decision !== "missing-offer" && decision !== "missing-student") {
        const key = `${offer.id}:${contextualStudent.id}`;
        const group = simalGroups.get(key) ?? [];
        group.push(grade);
        simalGroups.set(key, group);
      }

      if (apply && decision === "backfill" && offer && contextualStudent) {
        await db.update(schema.externalClassGrades)
          .set({ offerId: offer.id, courseOfferStudentId: contextualStudent.id, updatedAt: new Date() })
          .where(eq(schema.externalClassGrades.id, grade.id));
      }
    }
  }

  const composites = Array.from(simalGroups.entries()).map(([key, grades]) => {
    const [offerId, courseOfferStudentId] = key.split(":").map(Number);
    const composite = calculateSimalComposite(grades.map((grade) => ({
      assessmentTitle: grade.assessmentTitle,
      assessmentType: grade.assessmentType,
      assessmentComponent: grade.assessmentComponent,
      score: grade.score,
      maxScore: grade.maxScore,
      createdAt: grade.createdAt,
    })));
    return { offerId, courseOfferStudentId, gradeCount: grades.length, ...composite };
  });
  const summary = gradePlans.reduce<Record<string, number>>((result, plan) => {
    const decision = String(plan.decision);
    result[decision] = (result[decision] ?? 0) + 1;
    return result;
  }, {});
  print({
    generatedAt: new Date().toISOString(),
    status: Object.keys(summary).some((key) => ["conflict", "missing-offer", "missing-student"].includes(key)) ? "blocked" : "ok",
    apply,
    classId,
    gradeCount: gradePlans.length,
    summary,
    simalComposites: composites,
    grades: gradePlans,
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
