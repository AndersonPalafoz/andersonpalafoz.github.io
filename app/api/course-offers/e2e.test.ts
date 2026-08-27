import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  userFindFirst: vi.fn(),
  courseFindFirst: vi.fn(),
  createCourseOffer: vi.fn(),
  listCourseOffers: vi.fn(),
  getCourseOfferById: vi.fn(),
  updateCourseOffer: vi.fn(),
  softDeleteCourseOffer: vi.fn(),
  restoreCourseOffer: vi.fn(),
  canManageCourseOffer: vi.fn(),
  canReadCourseOffer: vi.fn(),
}));

vi.mock("next-auth/next", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({
  db: { query: { users: { findFirst: mocks.userFindFirst }, courses: { findFirst: mocks.courseFindFirst } } },
}));
vi.mock("@/lib/course-offer-service", () => ({
  createCourseOffer: mocks.createCourseOffer,
  listCourseOffers: mocks.listCourseOffers,
  getCourseOfferById: mocks.getCourseOfferById,
  updateCourseOffer: mocks.updateCourseOffer,
  softDeleteCourseOffer: mocks.softDeleteCourseOffer,
  restoreCourseOffer: mocks.restoreCourseOffer,
}));
vi.mock("@/lib/admin-auth", () => ({
  requireTeacherOrAdmin: async () => {
    const session = await mocks.getServerSession();
    return session;
  },
  canManageCourseOffer: mocks.canManageCourseOffer,
  canReadCourseOffer: mocks.canReadCourseOffer,
}));

import { GET as listGET, POST as listPOST } from "./route";
import { GET as itemGET, PATCH as itemPATCH } from "./[id]/route";

const adminSession = { user: { email: "admin@example.com", role: "admin" } };
const teacherSession = { user: { email: "teacher@example.com", role: "professor" } };
const course = { id: 12, title: "Inglês B1", deletedAt: null };
const user = { id: 7, email: "teacher@example.com", role: "professor" };
const offer = { id: 50, courseId: 12, offerName: "Matutino — 2026.2", academicTerm: "2026.2", ownerTeacherId: 7, deletedAt: null };

const context = (id: number) => ({ params: Promise.resolve({ id: String(id) }) });

describe("E2E API de ofertas e coortes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getServerSession.mockResolvedValue(null);
    mocks.userFindFirst.mockResolvedValue(user);
    mocks.courseFindFirst.mockResolvedValue(course);
    mocks.listCourseOffers.mockResolvedValue([offer]);
    mocks.createCourseOffer.mockResolvedValue(offer);
    mocks.getCourseOfferById.mockResolvedValue(offer);
    mocks.updateCourseOffer.mockResolvedValue({ ...offer, offerName: "Noturno — 2026.2" });
    mocks.canManageCourseOffer.mockResolvedValue(true);
    mocks.canReadCourseOffer.mockResolvedValue(true);
  });

  it("rejeita acesso anônimo à coleção", async () => {
    const response = await listGET(new NextRequest("http://localhost/api/course-offers"));
    expect(response.status).toBe(403);
  });

  it("cria oferta como administrador e retorna 201", async () => {
    mocks.getServerSession.mockResolvedValue(adminSession);
    mocks.userFindFirst.mockResolvedValue({ id: 1, email: adminSession.user.email, role: "admin" });
    const response = await listPOST(new NextRequest("http://localhost/api/course-offers", {
      method: "POST",
      body: JSON.stringify({ courseId: 12, offerName: "Matutino — 2026.2", academicTerm: "2026.2", ownerTeacherId: 7 }),
    }));
    expect(response.status).toBe(201);
    expect(mocks.createCourseOffer).toHaveBeenCalledWith(expect.objectContaining({ courseId: 12, ownerTeacherId: 7 }));
  });

  it("lista ofertas para professor autorizado", async () => {
    mocks.getServerSession.mockResolvedValue(teacherSession);
    const response = await listGET(new NextRequest("http://localhost/api/course-offers"));
    expect(response.status).toBe(200);
    expect((await response.json()).offers).toHaveLength(1);
  });

  it("bloqueia leitura de oferta quando o escopo falha", async () => {
    mocks.getServerSession.mockResolvedValue(teacherSession);
    mocks.canReadCourseOffer.mockResolvedValue(false);
    const response = await itemGET(new NextRequest("http://localhost/api/course-offers/50"), context(50));
    expect(response.status).toBe(403);
    expect(mocks.getCourseOfferById).not.toHaveBeenCalled();
  });

  it("atualiza oferta autorizada e retorna o novo estado", async () => {
    mocks.getServerSession.mockResolvedValue(teacherSession);
    const response = await itemPATCH(new NextRequest("http://localhost/api/course-offers/50", {
      method: "PATCH",
      body: JSON.stringify({ offerName: "Noturno — 2026.2", courseId: 999, ownerTeacherId: 999 }),
    }), context(50));
    expect(response.status).toBe(200);
    expect(mocks.updateCourseOffer).toHaveBeenCalledWith(50, expect.not.objectContaining({ courseId: 999, ownerTeacherId: 999 }));
    expect((await response.json()).offer.offerName).toContain("Noturno");
  });
});
