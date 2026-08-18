import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("next-auth", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({ db: { query: { adminAuditLogs: { findMany: mocks.findMany } } } }));

import { GET } from "./route";

const superAdmin = { user: { email: "palafozanderson@gmail.com", role: "admin" } };
const otherAdmin = { user: { email: "other@example.com", role: "admin" } };

describe("Admin activity audit API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getServerSession.mockResolvedValue(null);
    mocks.findMany.mockResolvedValue([]);
  });

  it("requires the designated super-admin", async () => {
    mocks.getServerSession.mockResolvedValue(otherAdmin);
    const response = await GET(new NextRequest("http://localhost/api/admin/activity"));
    expect(response.status).toBe(403);
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it("rejects unknown action filters", async () => {
    mocks.getServerSession.mockResolvedValue(superAdmin);
    const response = await GET(new NextRequest("http://localhost/api/admin/activity?action=unknown"));
    expect(response.status).toBe(400);
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it("passes bounded pagination to the persisted query", async () => {
    mocks.getServerSession.mockResolvedValue(superAdmin);
    const response = await GET(new NextRequest("http://localhost/api/admin/activity?action=create&limit=1000&offset=25"));
    expect(response.status).toBe(200);
    expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({ limit: 100, offset: 25 }));
    expect(await response.json()).toMatchObject({ activities: [], pagination: { limit: 100, offset: 25, hasMore: false } });
  });
});

export {};
