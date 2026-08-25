import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
}));

vi.mock("next-auth", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({
  db: {
    query: {
      users: {
        findMany: mocks.findMany,
        findFirst: mocks.findFirst,
      },
    },
    update: mocks.update,
    insert: mocks.insert,
  },
}));

import { DELETE, GET, PUT } from "./route";

const superAdminSession = {
  user: { id: "1", email: "palafozanderson@gmail.com", role: "admin" },
};

const teacherAdminSession = {
  user: { id: "2", email: "teacher@example.com", role: "admin" },
};

const studentSession = {
  user: { id: "3", email: "student@example.com", role: "user" },
};

const pendingUser = {
  id: 7,
  name: "Novo aluno",
  email: "student@example.com",
  role: "user" as const,
  approvalStatus: "pending" as const,
  deletedAt: null,
  phone: null,
  location: null,
  bio: null,
  loginMethod: "google",
  createdAt: new Date("2026-08-15"),
  updatedAt: new Date("2026-08-15"),
  lastSignedIn: new Date("2026-08-15"),
};

function updateChain(result: unknown) {
  const returning = vi.fn().mockResolvedValue(result);
  const where = vi.fn().mockReturnValue({ returning });
  const set = vi.fn().mockReturnValue({ where });
  mocks.update.mockReturnValue({ set });
  return { set, where, returning };
}

describe("Admin users API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getServerSession.mockResolvedValue(null);
    mocks.findMany.mockResolvedValue([]);
    mocks.findFirst.mockResolvedValue(undefined);
    mocks.insert.mockReturnValue({ values: vi.fn().mockResolvedValue([]) });
  });

  it("rejects unauthenticated access", async () => {
    const response = await GET();
    expect(response.status).toBe(403);
  });

  it("rejects an administrator who is not the designated super-admin", async () => {
    mocks.getServerSession.mockResolvedValue(teacherAdminSession);
    const response = await GET();
    expect(response.status).toBe(403);
  });

  it("returns pending accounts to the super-admin", async () => {
    mocks.getServerSession.mockResolvedValue(superAdminSession);
    mocks.findMany.mockResolvedValue([pendingUser]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.users[0]).toMatchObject({
      id: 7,
      approvalStatus: "pending",
      deletedAt: null,
    });
  });

  it("approves a pending account", async () => {
    mocks.getServerSession.mockResolvedValue(superAdminSession);
    mocks.findFirst.mockResolvedValue(pendingUser);
    const updated = { ...pendingUser, approvalStatus: "approved" as const };
    const chain = updateChain([updated]);

    const response = await PUT(new Request("http://localhost/api/admin/users", {
      method: "PUT",
      body: JSON.stringify({ userId: 7, approvalStatus: "approved" }),
    }) as never);

    expect(response.status).toBe(200);
    expect(chain.set).toHaveBeenCalledWith(expect.objectContaining({ approvalStatus: "approved" }));
    expect((await response.json()).user.approvalStatus).toBe("approved");
    expect(mocks.insert).toHaveBeenCalledOnce();
  });

  it("restores a logically deleted account", async () => {
    mocks.getServerSession.mockResolvedValue(superAdminSession);
    mocks.findFirst.mockResolvedValue({ ...pendingUser, deletedAt: new Date("2026-08-15") });
    const chain = updateChain([{ ...pendingUser, deletedAt: null }]);

    const response = await PUT(new Request("http://localhost/api/admin/users", {
      method: "PUT",
      body: JSON.stringify({ userId: 7, action: "restore" }),
    }) as never);

    expect(response.status).toBe(200);
    expect(chain.set).toHaveBeenCalledWith(expect.objectContaining({ deletedAt: null }));
    expect((await response.json()).user.deletedAt).toBeNull();
    expect(mocks.insert).toHaveBeenCalledOnce();
  });

  it("edits only non-sensitive profile fields", async () => {
    mocks.getServerSession.mockResolvedValue(superAdminSession);
    mocks.findFirst.mockResolvedValue(pendingUser);
    const updated = { ...pendingUser, name: "Nome Atualizado", phone: "+55 71 99999-0000", location: "Salvador", bio: "Professor" };
    const chain = updateChain([updated]);

    const response = await PUT(new Request("http://localhost/api/admin/users", {
      method: "PUT",
      body: JSON.stringify({ userId: 7, name: updated.name, phone: updated.phone, location: updated.location, bio: updated.bio }),
    }) as never);

    expect(response.status).toBe(200);
    expect(chain.set).toHaveBeenCalledWith(expect.objectContaining({
      name: updated.name,
      phone: updated.phone,
      location: updated.location,
      bio: updated.bio,
    }));
    expect((await response.json()).user).toMatchObject({ name: updated.name, phone: updated.phone, location: updated.location, bio: updated.bio });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("soft-deletes a professor account through the same super-admin flow", async () => {
    mocks.getServerSession.mockResolvedValue(superAdminSession);
    const teacher = { ...pendingUser, id: 8, name: "Professor de Teste", email: "professor@example.com", role: "professor" as const, approvalStatus: "approved" as const };
    mocks.findFirst.mockResolvedValue(teacher);
    const chain = updateChain([{ ...teacher, deletedAt: new Date("2026-08-25") }]);

    const response = await DELETE(new Request("http://localhost/api/admin/users?id=8", { method: "DELETE" }) as never);

    expect(response.status).toBe(200);
    expect(chain.set).toHaveBeenCalledWith(expect.objectContaining({ deletedAt: expect.any(Date), updatedAt: expect.any(Date) }));
    expect((await response.json()).user.role).toBe("professor");
  });

  it("soft-deletes a user but never the principal account", async () => {
    mocks.getServerSession.mockResolvedValue(superAdminSession);
    mocks.findFirst.mockResolvedValue(pendingUser);
    const chain = updateChain([{ ...pendingUser, deletedAt: new Date("2026-08-15") }]);

    const response = await DELETE(new Request("http://localhost/api/admin/users?id=7", { method: "DELETE" }) as never);
    expect(response.status).toBe(200);
    expect(chain.set).toHaveBeenCalledWith(expect.objectContaining({ deletedAt: expect.any(Date) }));
    expect(mocks.insert).toHaveBeenCalledOnce();

    mocks.findFirst.mockResolvedValue({ ...pendingUser, email: "palafozanderson@gmail.com" });
    const protectedResponse = await DELETE(new Request("http://localhost/api/admin/users?id=7", { method: "DELETE" }) as never);
    expect(protectedResponse.status).toBe(403);
  });

  it("rejects student sessions from changing account roles", async () => {
    mocks.getServerSession.mockResolvedValue(studentSession);
    const response = await PUT(new Request("http://localhost/api/admin/users", {
      method: "PUT",
      body: JSON.stringify({ userId: 7, role: "admin" }),
    }) as never);
    expect(response.status).toBe(403);
    expect(mocks.findFirst).not.toHaveBeenCalled();
  });
});

export {};
