import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  getMaterials: vi.fn(),
  getTrashMaterials: vi.fn().mockResolvedValue([]),
  createMaterial: vi.fn(),
  updateMaterial: vi.fn(),
  deleteMaterial: vi.fn(),
  db: {
    query: {
      articles: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([
            {
              id: 1,
              title: "Worksheet A1",
              category: "Worksheets",
              level: "A1",
              fileUrl: "https://example.com/a1.pdf",
            },
          ]),
        }),
      }),
    }),
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: mocks.getServerSession,
}));

vi.mock("next-auth/next", () => ({
  getServerSession: mocks.getServerSession,
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/db", () => ({
  getMaterials: () => mocks.db.select().from().where().orderBy(),
  getTrashMaterials: mocks.getTrashMaterials,
  createMaterial: mocks.createMaterial,
  updateMaterial: mocks.updateMaterial,
  deleteMaterial: mocks.deleteMaterial,
  softDeleteMaterial: vi.fn(),
  restoreMaterial: vi.fn(),
  db: mocks.db,
}));

import { GET as getBlog } from "./blog/route";
import { POST as postBlog } from "./blog/route";
import { GET as getMaterials } from "./materials/route";
import { DELETE as deleteMaterials } from "./materials/route";

const adminSession = {
  user: {
    id: "1",
    email: "palafozanderson@gmail.com",
    role: "admin",
  },
};

const studentSession = {
  user: {
    id: "2",
    email: "student@example.com",
    role: "user",
  },
};

describe("Admin content API contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getServerSession.mockResolvedValue(null);
  });

  describe("Blog", () => {
    it("rejects unauthenticated list requests", async () => {
      const response = await getBlog();

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized" });
    });

    it("rejects non-admin list requests", async () => {
      mocks.getServerSession.mockResolvedValue(studentSession);

      const response = await getBlog();

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized" });
    });

    it("returns the posts envelope for an administrator", async () => {
      mocks.getServerSession.mockResolvedValue(adminSession);
      mocks.db.query.articles.findMany.mockResolvedValue([
        {
          id: 1,
          title: "Post de teste",
          slug: "post-de-teste",
          category: "Gramática",
          published: new Date("2026-01-01"),
          readingTime: 5,
          createdAt: new Date("2026-01-01"),
        },
      ]);

      const response = await getBlog();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.posts).toHaveLength(1);
      expect(body.posts[0]).toMatchObject({
        id: 1,
        slug: "post-de-teste",
        category: "Gramática",
      });
    });

    it("validates required fields when creating a post", async () => {
      mocks.getServerSession.mockResolvedValue(adminSession);

      const response = await postBlog(
        new Request("http://localhost/api/admin/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Sem conteúdo" }),
        }) as never,
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "Missing required fields" });
      expect(mocks.db.query.articles.findFirst).not.toHaveBeenCalled();
    });
  });

  describe("Materials", () => {
    it("rejects unauthenticated list requests", async () => {
      const response = await getMaterials();

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized" });
    });



    it("requires an id when deleting a material", async () => {
      mocks.getServerSession.mockResolvedValue(adminSession);

      const response = await deleteMaterials(
        new Request("http://localhost/api/admin/materials", { method: "DELETE" }) as never,
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "ID is required" });
      expect(mocks.deleteMaterial).not.toHaveBeenCalled();
    });
  });
});

export {};
