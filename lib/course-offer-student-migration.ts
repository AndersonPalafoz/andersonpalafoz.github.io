import type { CourseOfferStudent, ExternalStudent } from "@/drizzle/schema";

export type StudentOfferMigrationDecision =
  | "insert"
  | "already-linked"
  | "conflict"
  | "missing-offer"
  | "skipped-inactive";

export type StudentOfferMigrationPlan = {
  externalClassId: number;
  offerId: number | null;
  externalStudentId: number;
  studentName: string;
  decision: StudentOfferMigrationDecision;
  reason?: string;
};

export function studentOfferMigrationDecision(input: {
  externalClassId: number;
  externalStudent: Pick<ExternalStudent, "id" | "name" | "status" | "userId">;
  offerId: number | null;
  existingByExternalId?: Pick<CourseOfferStudent, "id" | "userId" | "externalStudentId"> | null;
  existingByUserId?: Pick<CourseOfferStudent, "id" | "userId" | "externalStudentId"> | null;
  includeInactive?: boolean;
}): StudentOfferMigrationPlan {
  const { externalStudent } = input;
  const base = {
    externalClassId: input.externalClassId,
    offerId: input.offerId,
    externalStudentId: externalStudent.id,
    studentName: externalStudent.name,
  };

  if (!input.includeInactive && externalStudent.status !== "active") {
    return { ...base, decision: "skipped-inactive", reason: `status legado ${externalStudent.status}` };
  }
  if (!input.offerId) {
    return { ...base, decision: "missing-offer", reason: "não existe oferta vinculada à turma legada" };
  }
  if (input.existingByExternalId) {
    return { ...base, decision: "already-linked", reason: `vínculo ${input.existingByExternalId.id} já existe` };
  }
  if (input.existingByUserId) {
    return { ...base, decision: "conflict", reason: `o usuário já está vinculado à oferta pelo registro ${input.existingByUserId.id}` };
  }
  return { ...base, decision: "insert" };
}

export function summarizeStudentOfferMigration(plans: readonly StudentOfferMigrationPlan[]) {
  return plans.reduce<Record<StudentOfferMigrationDecision, number>>(
    (summary, plan) => {
      summary[plan.decision] += 1;
      return summary;
    },
    { insert: 0, "already-linked": 0, conflict: 0, "missing-offer": 0, "skipped-inactive": 0 },
  );
}
