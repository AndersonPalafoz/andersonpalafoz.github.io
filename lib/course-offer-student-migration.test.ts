import { describe, expect, it } from "vitest";
import {
  studentOfferMigrationDecision,
  summarizeStudentOfferMigration,
} from "./course-offer-student-migration";

const student = { id: 12, name: "Aluno Externo", status: "active", userId: null } as const;

const base = { externalClassId: 5, externalStudent: student, offerId: 20 };

describe("course offer student migration", () => {
  it("plans a new active external student for insertion", () => {
    expect(studentOfferMigrationDecision(base)).toMatchObject({
      externalClassId: 5,
      offerId: 20,
      externalStudentId: 12,
      decision: "insert",
    });
  });

  it("is idempotent when the external student is already linked", () => {
    expect(studentOfferMigrationDecision({
      ...base,
      existingByExternalId: { id: 100, userId: null, externalStudentId: 12 },
    }).decision).toBe("already-linked");
  });

  it("reports a conflict when the linked user already exists in the offer", () => {
    expect(studentOfferMigrationDecision({
      ...base,
      externalStudent: { ...student, userId: 44 },
      existingByUserId: { id: 101, userId: 44, externalStudentId: null },
    }).decision).toBe("conflict");
  });

  it("does not migrate inactive students by default", () => {
    expect(studentOfferMigrationDecision({
      ...base,
      externalStudent: { ...student, status: "inactive" },
    }).decision).toBe("skipped-inactive");
  });

  it("reports missing offers without creating a dangling membership", () => {
    expect(studentOfferMigrationDecision({ ...base, offerId: null }).decision).toBe("missing-offer");
  });

  it("summarizes decisions", () => {
    const plans = [
      studentOfferMigrationDecision(base),
      studentOfferMigrationDecision({ ...base, existingByExternalId: { id: 100, userId: null, externalStudentId: 12 } }),
    ];
    expect(summarizeStudentOfferMigration(plans)).toMatchObject({ insert: 1, "already-linked": 1 });
  });
});
