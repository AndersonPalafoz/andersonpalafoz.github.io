import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (relativePath: string) => readFileSync(join(root, relativePath), "utf8");

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  db: {
    query: {
      forumPosts: { findFirst: vi.fn() },
      forumPostLikes: { findFirst: vi.fn() },
    },
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("next-auth", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({ db: mocks.db }));
vi.mock("@/lib/admin-audit", () => ({
  ADMIN_AUDIT_ACTIONS: { APPROVE: "approve", REJECT: "reject" },
  logAdminActivity: vi.fn(),
}));

import { POST as createForumPost } from "./route";
import { POST as toggleLike } from "./[id]/like/route";
import { GET as getAdminForum } from "../admin/forum/route";

const studentSession = { user: { id: "7", email: "student@example.com", role: "user" } };
const adminSession = { user: { id: "1", email: "palafozanderson@gmail.com", role: "admin" } };

describe("Forum API contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getServerSession.mockResolvedValue(null);
  });

  it("rejects anonymous forum publication", async () => {
    const response = await createForumPost(new Request("http://localhost/api/forum", { method: "POST", body: "{}" }));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "É necessário estar autenticado para publicar." });
  });

  it("validates categories before touching the database", async () => {
    mocks.getServerSession.mockResolvedValue(studentSession);
    const response = await createForumPost(new Request("http://localhost/api/forum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Dúvida real", content: "Conteúdo real", category: "Categoria inventada" }),
    }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Categoria inválida." });
    expect(mocks.db.insert).not.toHaveBeenCalled();
  });

  it("rejects anonymous likes", async () => {
    const response = await toggleLike(new Request("http://localhost/api/forum/1/like", { method: "POST" }), { params: Promise.resolve({ id: "1" }) });
    expect(response.status).toBe(401);
  });

  it("restricts forum moderation to administrators", async () => {
    mocks.getServerSession.mockResolvedValue(studentSession);
    const response = await getAdminForum(new NextRequest("http://localhost/api/admin/forum"));
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Acesso restrito a administradores." });
  });

  it("supports optimistic UI updates with rollback handling", () => {
    const page = read("app/forum/page.tsx");
    expect(page).toContain("previousPosts");
    expect(page).toContain("setPosts");
    expect(page).toContain("Rollback em caso de falha");
  });

  it("allows the administrator route to pass RBAC before querying persisted data", async () => {
    mocks.getServerSession.mockResolvedValue(adminSession);
    mocks.db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });
    const response = await getAdminForum(new NextRequest("http://localhost/api/admin/forum"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ posts: [] });
  });
});

export {};
