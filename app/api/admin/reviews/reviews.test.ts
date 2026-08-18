import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  db: {
    query: { courseReviews: { findMany: vi.fn(), findFirst: vi.fn() }, courses: { findMany: vi.fn() }, users: { findFirst: vi.fn() } },
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

vi.mock("next-auth", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({ db: mocks.db }));

import { GET, PATCH } from "./route";

const studentSession = { user: { id: "2", email: "student@example.com", role: "user" } };
const adminSession = { user: { id: "1", email: "palafozanderson@gmail.com", role: "admin" } };

describe("Admin reviews API contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getServerSession.mockResolvedValue(null);
  });

  it("rejects non-admin reads", async () => {
    mocks.getServerSession.mockResolvedValue(studentSession);
    const response = await GET(new Request("http://localhost/api/admin/reviews") as never);
    expect(response.status).toBe(403);
  });

  it("validates reply input before querying a review", async () => {
    mocks.getServerSession.mockResolvedValue(adminSession);
    const response = await PATCH(new Request("http://localhost/api/admin/reviews", { method: "PATCH", body: JSON.stringify({ courseId: 1, reviewId: 1, message: "" }) }));
    expect(response.status).toBe(400);
    expect(mocks.db.query.courseReviews.findFirst).not.toHaveBeenCalled();
  });
});

export {};
