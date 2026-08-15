import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getArticles: vi.fn(),
  getMaterials: vi.fn(),
}));

vi.mock("./db", () => ({
  getArticles: mocks.getArticles,
  getMaterials: mocks.getMaterials,
}));

import { getPublicArticles, getPublicMaterials } from "./public-content";

describe("public content resilience", () => {
  beforeEach(() => {
    mocks.getArticles.mockReset();
    mocks.getMaterials.mockReset();
    vi.spyOn(console, "info").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns published article data when the database is available", async () => {
    const articles = [{ id: 1, title: "Pronúncia", published: new Date() }];
    mocks.getArticles.mockResolvedValue(articles);

    await expect(getPublicArticles()).resolves.toEqual({
      articles,
      available: true,
    });
  });

  it("returns an empty article collection when the database is unavailable", async () => {
    mocks.getArticles.mockRejectedValue(new Error("connection timeout"));

    await expect(getPublicArticles()).resolves.toEqual({
      articles: [],
      available: false,
    });
  });

  it("returns material data when the database is available", async () => {
    const materials = [{ id: 1, title: "Worksheet A1", level: "A1" }];
    mocks.getMaterials.mockResolvedValue(materials);

    await expect(getPublicMaterials()).resolves.toEqual({
      materials,
      available: true,
    });
  });

  it("returns an empty material collection when the database is unavailable", async () => {
    mocks.getMaterials.mockRejectedValue(new Error("connection timeout"));

    await expect(getPublicMaterials()).resolves.toEqual({
      materials: [],
      available: false,
    });
  });
});
