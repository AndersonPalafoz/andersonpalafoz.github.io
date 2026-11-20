import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  canManageCourseOffer: vi.fn(),
  userFindFirst: vi.fn(),
  offerFindFirst: vi.fn(),
  insert: vi.fn(),
  insertValues: [] as unknown[],
  selectResults: [] as unknown[],
  queryCalls: [] as Array<{ table?: unknown; where?: unknown }>,
  select: vi.fn(),
  selectDistinct: vi.fn(),
}));

function createQueryBuilder() {
  const call = { table: undefined as unknown, where: undefined as unknown };
  mocks.queryCalls.push(call);
  const builder = {
    from: vi.fn((table: unknown) => { call.table = table; return builder; }),
    leftJoin: vi.fn(() => builder),
    innerJoin: vi.fn(() => builder),
    where: vi.fn((condition: unknown) => { call.where = condition; return builder; }),
    orderBy: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    offset: vi.fn(() => builder),
    then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve(mocks.selectResults.shift()).then(resolve, reject),
  };
  return builder;
}

mocks.select.mockImplementation(() => createQueryBuilder());
mocks.selectDistinct.mockImplementation(() => createQueryBuilder());

vi.mock("next-auth", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({
  db: {
    query: {
      users: { findFirst: mocks.userFindFirst },
      courseOffers: { findFirst: mocks.offerFindFirst },
    },
    insert: mocks.insert,
    select: mocks.select,
    selectDistinct: mocks.selectDistinct,
  },
}));
vi.mock("@/lib/admin-auth", () => ({
  canManageCourseOffer: mocks.canManageCourseOffer,
}));

import { DELETE, GET, PATCH, POST } from "./route";

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
    mocks.userFindFirst.mockResolvedValue({ id: 7, email: "teacher@example.com", role: "professor" });
    mocks.offerFindFirst.mockResolvedValue({ courseId: 5 });
    mocks.insert.mockImplementation(() => {
      const insertIndex = mocks.insertValues.length;
      return {
        values: (value: unknown) => {
          mocks.insertValues.push(value);
          return insertIndex === 0 ? { returning: async () => [{ id: 10 }] } : Promise.resolve([]);
        },
      };
    });
    mocks.insertValues = [];
    mocks.selectResults = [];
    mocks.queryCalls = [];
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

  it("rejeita status de presença inválido", async () => {
    mocks.canManageCourseOffer.mockResolvedValue(true);

    const response = await POST(request("POST", {
      offerId: 40,
      title: "Aula",
      scheduledAt: "2026-11-20T12:00:00.000Z",
      attendanceRecords: [{ studentId: 70, status: "late" }],
    }));

    expect(response.status).toBe(400);
  });

  it("salva presença válida somente para aluno matriculado na turma", async () => {
    mocks.canManageCourseOffer.mockResolvedValue(true);
    mocks.selectResults = [[{ userId: 70 }]];

    const response = await POST(request("POST", {
      offerId: 40,
      title: "Aula",
      scheduledAt: "2026-11-20T12:00:00.000Z",
      attendanceRecords: [{ studentId: 70, status: "present", notes: "Chegou no horário" }],
    }));

    expect(response.status).toBe(201);
    expect(mocks.insertValues[1]).toEqual([
      { sessionId: 10, studentId: 70, present: true, status: "present", notes: "Chegou no horário" },
    ]);
  });

  it("restringe a leitura de sessões ao conjunto de ofertas gerenciadas", async () => {
    mocks.selectResults = [
      [{ id: 40 }],
      [{ id: 10, offerId: 40 }],
      [{ id: 5, title: "Turma autorizada", level: "B1" }],
      [{ id: 70, name: "Aluno autorizado", email: "student@example.com" }],
      [{ id: 1, sessionId: 10, studentId: 70 }],
    ];

    const response = await GET(new NextRequest("http://localhost/api/admin/sessions"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.sessions).toEqual([{ id: 10, offerId: 40 }]);
    expect(payload.courses).toEqual([{ id: 5, title: "Turma autorizada", level: "B1" }]);
    expect(payload.students).toEqual([{ id: 70, name: "Aluno autorizado", email: "student@example.com" }]);
    expect(payload.attendances).toEqual([{ id: 1, sessionId: 10, studentId: 70 }]);
    expect(mocks.queryCalls[1].where).toBeDefined();
  });
});
