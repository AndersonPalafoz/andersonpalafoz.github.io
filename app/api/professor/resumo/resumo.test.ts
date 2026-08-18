import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  getUserByEmail: vi.fn(),
  select: vi.fn(),
}));

vi.mock("next-auth/next", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({
  getUserByEmail: mocks.getUserByEmail,
  db: { select: mocks.select },
}));

import { GET } from "./route";

describe("Teacher summary API contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getServerSession.mockResolvedValue(null);
  });

  it("rejects unauthenticated requests", async () => {
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("rejects non-teacher users", async () => {
    mocks.getServerSession.mockResolvedValue({ user: { email: "user@example.com", role: "user" } });
    mocks.getUserByEmail.mockResolvedValue({ id: 2, email: "user@example.com", role: "user" });
    const response = await GET();
    expect(response.status).toBe(403);
  });
});

export {};
