import type {
  CourseOffer,
  CourseOfferListResponse,
  CourseOfferResponse,
  CourseOfferStudent,
  CourseOfferStudentsResponse,
  CourseOfferTeacher,
  CourseOfferTeachersResponse,
} from "./course-offer-types";
import { CourseOfferApiError } from "./course-offer-types";

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? await response.json() : null;
  if (!response.ok) {
    throw new CourseOfferApiError(
      response.status,
      typeof body?.error === "string" ? body.error : "Não foi possível concluir a operação da oferta.",
    );
  }
  return body as T;
}

function jsonHeaders() {
  return { "Content-Type": "application/json" };
}

export async function getCourseOffers(options: { courseId?: number; includeDeleted?: boolean } = {}): Promise<CourseOffer[]> {
  const params = new URLSearchParams();
  if (options.courseId) params.set("courseId", String(options.courseId));
  if (options.includeDeleted) params.set("includeDeleted", "true");
  const query = params.toString();
  const response = await fetch(`/api/course-offers${query ? `?${query}` : ""}`, { cache: "no-store" });
  return (await parseResponse<CourseOfferListResponse>(response)).offers;
}

export async function createCourseOffer(payload: Partial<CourseOffer> & Pick<CourseOffer, "courseId" | "offerName" | "academicTerm">): Promise<CourseOffer> {
  const response = await fetch("/api/course-offers", {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  return (await parseResponse<CourseOfferResponse>(response)).offer;
}

export async function getCourseOffer(offerId: number): Promise<CourseOffer> {
  const response = await fetch(`/api/course-offers/${offerId}`, { cache: "no-store" });
  return (await parseResponse<CourseOfferResponse>(response)).offer;
}

export async function updateCourseOffer(offerId: number, payload: Partial<CourseOffer>): Promise<CourseOffer> {
  const response = await fetch(`/api/course-offers/${offerId}`, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  return (await parseResponse<CourseOfferResponse>(response)).offer;
}

export async function archiveCourseOffer(offerId: number): Promise<CourseOffer> {
  const response = await fetch(`/api/course-offers/${offerId}`, { method: "DELETE" });
  return (await parseResponse<CourseOfferResponse>(response)).offer;
}

export async function restoreCourseOffer(offerId: number): Promise<CourseOffer> {
  const response = await fetch(`/api/course-offers/${offerId}`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ action: "restore" }),
  });
  return (await parseResponse<CourseOfferResponse>(response)).offer;
}

export async function getCourseOfferTeachers(offerId: number): Promise<CourseOfferTeacher[]> {
  const response = await fetch(`/api/course-offers/${offerId}/teachers`, { cache: "no-store" });
  return (await parseResponse<CourseOfferTeachersResponse>(response)).teachers;
}

export async function getCourseOfferStudents(offerId: number): Promise<CourseOfferStudent[]> {
  const response = await fetch(`/api/course-offers/${offerId}/students`, { cache: "no-store" });
  return (await parseResponse<CourseOfferStudentsResponse>(response)).students;
}
