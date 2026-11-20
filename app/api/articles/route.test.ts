import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getPublicArticles: vi.fn() }));

vi.mock("@/lib/public-content", () => ({
  getPublicArticles: mocks.getPublicArticles,
}));

import { GET } from "./route";

describe("GET /api/articles", () => {
  beforeEach(() => mocks.getPublicArticles.mockReset());

  it("returns published articles only", async () => {
    const articles = [{ id: 1, title: "Artigo publicado", published: new Date() }];
    mocks.getPublicArticles.mockResolvedValue({ articles, available: true });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      articles: [{ ...articles[0], published: articles[0].published.toISOString() }],
    });
    expect(mocks.getPublicArticles).toHaveBeenCalledWith(100);
  });

  it("does not return a misleading empty success response when content is unavailable", async () => {
    mocks.getPublicArticles.mockResolvedValue({ articles: [], available: false });

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Conteúdo temporariamente indisponível.",
    });
  });
});
