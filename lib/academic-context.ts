import { and, eq, isNull } from "drizzle-orm";
import {
  courseOffers,
  externalClasses,
  type CourseOffer,
  type ExternalClass,
} from "@/drizzle/schema";
import {
  canManageCourseOffer,
  canManageExternalClass,
  canReadCourseOffer,
  type AdminAuthSession,
} from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { recordLegacyFallbackRead } from "@/lib/legacy-fallback-monitoring";

export type AcademicContextInput = {
  offerId?: number | string | null;
  classId?: number | string | null;
};

export type AcademicContextRef = {
  offerId: number | null;
  classId: number | null;
};

export type AcademicContext = {
  kind: "offer" | "legacy-class";
  id: number;
  offerId: number | null;
  classId: number | null;
  courseId: number | null;
  sourceExternalClassId: number | null;
  offer: CourseOffer | null;
  externalClass: ExternalClass | null;
};

export type AcademicContextAccess = "read" | "manage";

export function normalizeAcademicId(value: unknown): number | null {
  if (typeof value === "number") return Number.isInteger(value) && value > 0 ? value : null;
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!/^\d+$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export function parseAcademicContextInput(input: AcademicContextInput = {}): AcademicContextRef | null {
  const offerId = normalizeAcademicId(input.offerId);
  const classId = normalizeAcademicId(input.classId);
  if (!offerId && !classId) return null;
  return { offerId, classId };
}

export function contextQueryParams(context: AcademicContextRef): URLSearchParams {
  const params = new URLSearchParams();
  if (context.offerId) params.set("offerId", String(context.offerId));
  if (context.classId) params.set("classId", String(context.classId));
  return params;
}

export function buildAcademicContextFromOffer(offer: CourseOffer, externalClass: ExternalClass | null = null): AcademicContext {
  return {
    kind: "offer",
    id: offer.id,
    offerId: offer.id,
    classId: offer.sourceExternalClassId ?? externalClass?.id ?? null,
    courseId: offer.courseId,
    sourceExternalClassId: offer.sourceExternalClassId ?? null,
    offer,
    externalClass,
  };
}

export function buildAcademicContextFromLegacyClass(externalClass: ExternalClass): AcademicContext {
  return {
    kind: "legacy-class",
    id: externalClass.id,
    offerId: null,
    classId: externalClass.id,
    courseId: null,
    sourceExternalClassId: externalClass.id,
    offer: null,
    externalClass,
  };
}

export async function resolveAcademicContext(input: AcademicContextInput): Promise<AcademicContext | null> {
  const ref = parseAcademicContextInput(input);
  if (!ref) return null;

  if (ref.offerId) {
    const offer = await db.query.courseOffers.findFirst({
      where: and(eq(courseOffers.id, ref.offerId), isNull(courseOffers.deletedAt)),
    });
    if (!offer) return null;
    const externalClass = offer.sourceExternalClassId
      ? await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, offer.sourceExternalClassId) })
      : null;
    return buildAcademicContextFromOffer(offer, externalClass ?? null);
  }

  const legacyClassId = ref.classId!;
  const offer = await db.query.courseOffers.findFirst({
    where: and(eq(courseOffers.sourceExternalClassId, legacyClassId), isNull(courseOffers.deletedAt)),
  });
  if (offer) {
    recordLegacyFallbackRead({ classId: legacyClassId, reason: "class-id-compatibility" });
    const externalClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, legacyClassId) });
    return buildAcademicContextFromOffer(offer, externalClass ?? null);
  }

  const externalClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, legacyClassId) });
  if (externalClass) recordLegacyFallbackRead({ classId: legacyClassId, reason: "legacy-only-fallback" });
  return externalClass ? buildAcademicContextFromLegacyClass(externalClass) : null;
}

export async function canAccessAcademicContext(
  session: AdminAuthSession,
  context: AcademicContext,
  access: AcademicContextAccess,
): Promise<boolean> {
  if (context.kind === "offer" && context.offerId) {
    return access === "manage"
      ? canManageCourseOffer(session, context.offerId)
      : canReadCourseOffer(session, context.offerId);
  }
  if (context.kind === "legacy-class" && context.classId) {
    return canManageExternalClass(session, context.classId);
  }
  return false;
}

export async function resolveAndAuthorizeAcademicContext(
  session: AdminAuthSession,
  input: AcademicContextInput,
  access: AcademicContextAccess = "manage",
): Promise<{ context: AcademicContext; allowed: true } | { context: null; allowed: false }> {
  const context = await resolveAcademicContext(input);
  if (!context) return { context: null, allowed: false };
  const allowed = await canAccessAcademicContext(session, context, access);
  return allowed ? { context, allowed: true } : { context: null, allowed: false };
}
