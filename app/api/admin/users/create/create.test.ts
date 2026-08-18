import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  findFirst: vi.fn(),
  insert: vi.fn(),
}));

vi.mock("next-auth", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({
  db: {
    query: { users: { findFirst: mocks.findFirst } },
    insert: mocks.insert,
  },
}));

import { POST } from "./route";

const superAdminSession = { user: { id: "1", email: "palafozanderson@gmail.com", role: "admin" } };
const studentSession = { user: { id: "2", email: "student@example.com", role: "user" } };

describe("Manual user creation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getServerSession.mockResolvedValue(null);
    mocks.findFirst.mockResolvedValue(undefined);
    mocks.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 15, name: "Aluno Real", email: "real@example.com", role: "user", approvalStatus: "approved" }]),
      }),
    });
  });

  it("rejects non-super-admin sessions", async () => {
    mocks.getServerSession.mockResolvedValue(studentSession);
    const response = await POST(new Request("http://localhost/api/admin/users/create", { method: "POST", body: "{}" }) as never);
    expect(response.status).toBe(403);
  });

  it("creates a student without querying or inserting enrollments", async () => {
    mocks.getServerSession.mockResolvedValue(superAdminSession);
    const response = await POST(new Request("http://localhost/api/admin/users/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Aluno Real", email: "real@example.com", role: "user" }),
    }) as never);
    expect(response.status).toBe(200);
    expect((await response.json()).user).toMatchObject({ id: 15, email: "real@example.com", approvalStatus: "approved" });
    expect(mocks.insert).toHaveBeenCalledOnce();
    expect(mocks.findFirst).toHaveBeenCalledOnce();
  });
});

export {};
