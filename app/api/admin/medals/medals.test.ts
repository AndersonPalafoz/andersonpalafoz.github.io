import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  select: vi.fn(),
}));

vi.mock("next-auth/next", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({ db: { select: mocks.select } }));

import { GET } from "./route";

describe("Admin medals API contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getServerSession.mockResolvedValue(null);
  });

  it("rejects non-admin or unauthenticated requests", async () => {
    mocks.getServerSession.mockResolvedValue({ user: { email: "user@example.com", role: "user" } });
    const response = await GET();
    expect(response.status).toBe(401);
  });
});

export {};
