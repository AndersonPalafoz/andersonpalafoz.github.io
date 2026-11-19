import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  canManageCourseOffer: vi.fn(),
}));

vi.mock("next-auth", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/admin-auth", () => ({
  canManageCourseOffer: mocks.canManageCourseOffer,
}));

import { DELETE, PATCH, POST } from "./route";

const teacherSession = { user: { email: "teacher@example.com", role: "professor" } };

function request(method: string, body: Record<string, unknown>) {
  return new Request("http://localhost/api/admin/sessions", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("API de sessões — autorização por oferta", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getServerSession.mockResolvedValue(teacherSession);
    mocks.canManageCourseOffer.mockResolvedValue(false);
  });

  it("bloqueia criação de sessão para uma oferta não atribuída", async () => {
    const response = await POST(request("POST", {
      offerId: 40,
      title: "Aula",
      scheduledAt: "2026-11-20T12:00:00.000Z",
    }));

    expect(response.status).toBe(403);
    expect(mocks.canManageCourseOffer).toHaveBeenCalledWith(teacherSession, 40);
  });

  it("bloqueia alteração de sessão em uma oferta não atribuída", async () => {
    const response = await PATCH(request("PATCH", {
      id: 10,
      offerId: 40,
      title: "Aula atualizada",
      scheduledAt: "2026-11-20T12:00:00.000Z",
    }));

    expect(response.status).toBe(403);
    expect(mocks.canManageCourseOffer).toHaveBeenCalledWith(teacherSession, 40);
  });

  it("bloqueia exclusão de sessão em uma oferta não atribuída", async () => {
    const response = await DELETE(request("DELETE", { id: 10, offerId: 40 }));

    expect(response.status).toBe(403);
    expect(mocks.canManageCourseOffer).toHaveBeenCalledWith(teacherSession, 40);
  });
});
