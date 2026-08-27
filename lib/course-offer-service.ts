import { and, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { courseOfferTeacherAssignments, courseOffers, type CourseOffer, type InsertCourseOffer } from "@/drizzle/schema";
import { db } from "@/lib/db";

export type CourseOfferPayload = Omit<InsertCourseOffer, "id" | "createdAt" | "updatedAt" | "deletedAt">;

export async function listCourseOffers(options: {
  userId?: number;
  globalAdmin?: boolean;
  includeDeleted?: boolean;
} = {}): Promise<CourseOffer[]> {
  const { userId, globalAdmin = false, includeDeleted = false } = options;
  const deletedFilter = includeDeleted ? undefined : isNull(courseOffers.deletedAt);
  if (globalAdmin) {
    return db.query.courseOffers.findMany({ where: deletedFilter, orderBy: [desc(courseOffers.updatedAt)] });
  }
  if (!userId) return [];

  const assignments = await db
    .select({ offerId: courseOfferTeacherAssignments.offerId })
    .from(courseOfferTeacherAssignments)
    .where(eq(courseOfferTeacherAssignments.teacherId, userId));
  const assignedOfferIds = assignments.map(({ offerId }) => offerId);
  const accessFilter = assignedOfferIds.length > 0
    ? or(eq(courseOffers.ownerTeacherId, userId), inArray(courseOffers.id, assignedOfferIds))
    : eq(courseOffers.ownerTeacherId, userId);
  const where = deletedFilter ? and(deletedFilter, accessFilter) : accessFilter;
  return db.query.courseOffers.findMany({ where, orderBy: [desc(courseOffers.updatedAt)] });
}

export async function listPublishedCourseOffers(courseId: number): Promise<CourseOffer[]> {
  return db.query.courseOffers.findMany({
    where: and(
      eq(courseOffers.courseId, courseId),
      eq(courseOffers.status, "published"),
      isNull(courseOffers.deletedAt),
    ),
    orderBy: [desc(courseOffers.startDate), desc(courseOffers.updatedAt)],
  });
}

export async function getCourseOfferById(offerId: number): Promise<CourseOffer | undefined> {
  return db.query.courseOffers.findFirst({ where: eq(courseOffers.id, offerId) });
}

export async function createCourseOffer(payload: CourseOfferPayload): Promise<CourseOffer> {
  const [offer] = await db.insert(courseOffers).values(payload).returning();
  if (!offer) throw new Error("Não foi possível criar a oferta.");
  return offer;
}

export async function updateCourseOffer(offerId: number, payload: Partial<CourseOfferPayload>): Promise<CourseOffer | undefined> {
  const [offer] = await db.update(courseOffers)
    .set({ ...payload, updatedAt: new Date() })
    .where(and(eq(courseOffers.id, offerId), isNull(courseOffers.deletedAt)))
    .returning();
  return offer;
}

export async function softDeleteCourseOffer(offerId: number): Promise<CourseOffer | undefined> {
  const [offer] = await db.update(courseOffers)
    .set({ deletedAt: new Date(), updatedAt: new Date(), status: "archived" })
    .where(and(eq(courseOffers.id, offerId), isNull(courseOffers.deletedAt)))
    .returning();
  return offer;
}

export async function restoreCourseOffer(offerId: number): Promise<CourseOffer | undefined> {
  const [offer] = await db.update(courseOffers)
    .set({ deletedAt: null, updatedAt: new Date(), status: "draft" })
    .where(eq(courseOffers.id, offerId))
    .returning();
  return offer;
}
