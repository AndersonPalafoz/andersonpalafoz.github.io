import { beforeEach, describe, expect, it, vi } from "vitest";
import { archiveCourseOffer, createCourseOffer, getCourseOffers } from "./course-offer-client";
import { CourseOfferApiError } from "./course-offer-types";
import { isCourseOffersEnabled } from "./course-offer-feature";

describe("course offer frontend contracts", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("serializa courseId e includeDeleted na listagem", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ offers: [] }), { status: 200, headers: { "content-type": "application/json" } })));
    await getCourseOffers({ courseId: 12, includeDeleted: true });
    expect(fetch).toHaveBeenCalledWith("/api/course-offers?courseId=12&includeDeleted=true", { cache: "no-store" });
  });

  it("retorna uma mensagem de erro tipada para respostas HTTP", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "Sem permissão" }), { status: 403, headers: { "content-type": "application/json" } })));
    await expect(getCourseOffers()).rejects.toEqual(new CourseOfferApiError(403, "Sem permissão"));
  });

  it("mantém payload de criação explícito e arquivamento por DELETE", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ offer: { id: 1 } }), { status: 201, headers: { "content-type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ offer: { id: 1, status: "archived" } }), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    await createCourseOffer({ courseId: 10, offerName: "Turma A", academicTerm: "2026.2" });
    await archiveCourseOffer(1);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "POST", body: JSON.stringify({ courseId: 10, offerName: "Turma A", academicTerm: "2026.2" }) });
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: "DELETE" });
  });

  it("usa a flag explícita, a variável pública ou o fallback por ofertas", () => {
    expect(isCourseOffersEnabled({ enabled: false, hasOffers: true })).toBe(false);
    expect(isCourseOffersEnabled({ enabled: true, hasOffers: false })).toBe(true);
    expect(isCourseOffersEnabled({ hasOffers: true })).toBe(true);
    expect(isCourseOffersEnabled({ hasOffers: false })).toBe(false);
  });
});
