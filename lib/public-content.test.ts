import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findArticles: vi.fn(),
  findMaterials: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      articles: { findMany: mocks.findArticles },
      materials: { findMany: mocks.findMaterials },
    },
  },
}));

import { getPublicArticles, getPublicMaterials } from "./public-content";

describe("public content queries", () => {
  beforeEach(() => {
    mocks.findArticles.mockReset();
    mocks.findMaterials.mockReset();
    vi.spyOn(console, "info").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns only articles selected by the published-content query", async () => {
    const articles = [{ id: 1, title: "Pronúncia", published: new Date() }];
    mocks.findArticles.mockResolvedValue(articles);

    await expect(getPublicArticles(3)).resolves.toEqual({
      articles,
      available: true,
    });
    expect(mocks.findArticles).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 3, where: expect.anything(), orderBy: expect.anything() }),
    );
  });

  it("returns an unavailable state when the article query fails", async () => {
    mocks.findArticles.mockRejectedValue(new Error("connection timeout"));

    await expect(getPublicArticles()).resolves.toEqual({
      articles: [],
      available: false,
    });
  });

  it("returns material data from the public-only query", async () => {
    const materials = [{ id: 1, title: "Worksheet A1", level: "A1" }];
    mocks.findMaterials.mockResolvedValue(materials);

    await expect(getPublicMaterials(3)).resolves.toEqual({
      materials,
      available: true,
    });
    expect(mocks.findMaterials).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 3, where: expect.anything(), orderBy: expect.anything() }),
    );
  });

  it("returns an empty collection when the material query fails", async () => {
    mocks.findMaterials.mockRejectedValue(new Error("connection timeout"));

    await expect(getPublicMaterials()).resolves.toEqual({
      materials: [],
      available: false,
    });
  });
});
