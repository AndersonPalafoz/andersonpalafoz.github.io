import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      courseOffers: { findFirst: mocks.findFirst },
      externalClasses: { findFirst: mocks.findFirst },
    },
  },
}));

vi.mock("@/lib/admin-auth", () => ({
  canManageCourseOffer: vi.fn(),
  canManageExternalClass: vi.fn(),
  canReadCourseOffer: vi.fn(),
}));

import {
  buildAcademicContextFromLegacyClass,
  buildAcademicContextFromOffer,
  contextQueryParams,
  normalizeAcademicId,
  parseAcademicContextInput,
  resolveAcademicContext,
} from "@/lib/academic-context";

const offer = {
  id: 14,
  courseId: 3,
  sourceExternalClassId: 5,
  offerName: "Matutino",
  academicTerm: "2026.1",
  ownerTeacherId: 7,
  status: "published",
  gradeStatus: "open",
  gradingPolicy: "simal",
  gradingScope: "course",
  deletedAt: null,
} as any;

const externalClass = { id: 5, name: "Turma Matutino", teacherId: 7 } as any;

describe("academic context adapter", () => {
  beforeEach(() => {
    mocks.findFirst.mockReset();
  });

  it("normalizes only positive safe integer identifiers", () => {
    expect(normalizeAcademicId(4)).toBe(4);
    expect(normalizeAcademicId(" 4 ")).toBe(4);
    expect(normalizeAcademicId("4.5")).toBeNull();
    expect(normalizeAcademicId("0")).toBeNull();
    expect(normalizeAcademicId("abc")).toBeNull();
    expect(normalizeAcademicId(null)).toBeNull();
  });

  it("keeps offerId and classId distinct when parsing context input", () => {
    expect(parseAcademicContextInput({ offerId: "14", classId: "5" })).toEqual({ offerId: 14, classId: 5 });
    expect(parseAcademicContextInput({ classId: "5" })).toEqual({ offerId: null, classId: 5 });
    expect(parseAcademicContextInput({})).toBeNull();
  });

  it("serializes only the identifiers that exist", () => {
    expect([...contextQueryParams({ offerId: 14, classId: 5 }).entries()]).toEqual([["offerId", "14"], ["classId", "5"]]);
    expect([...contextQueryParams({ offerId: null, classId: 5 }).entries()]).toEqual([["classId", "5"]]);
  });

  it("builds explicit legacy and offer contexts", () => {
    expect(buildAcademicContextFromOffer(offer, externalClass)).toMatchObject({ kind: "offer", id: 14, offerId: 14, classId: 5, courseId: 3, sourceExternalClassId: 5 });
    expect(buildAcademicContextFromLegacyClass(externalClass)).toMatchObject({ kind: "legacy-class", id: 5, offerId: null, classId: 5, courseId: null, sourceExternalClassId: 5 });
  });

  it("resolves a legacy class to its migrated offer when available", async () => {
    mocks.findFirst.mockResolvedValueOnce(offer).mockResolvedValueOnce(externalClass);
    await expect(resolveAcademicContext({ classId: 5 })).resolves.toMatchObject({ kind: "offer", offerId: 14, classId: 5 });
  });

  it("falls back to a legacy class when no migrated offer exists", async () => {
    mocks.findFirst.mockResolvedValueOnce(undefined).mockResolvedValueOnce(externalClass);
    await expect(resolveAcademicContext({ classId: 5 })).resolves.toMatchObject({ kind: "legacy-class", offerId: null, classId: 5 });
  });
});
