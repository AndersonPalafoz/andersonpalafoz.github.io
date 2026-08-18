import { describe, expect, it } from "vitest";
import { getMediaPaginationMeta, parseMediaListQuery } from "./media-pagination";

describe("media pagination contract", () => {
  it("uses safe defaults and caps the page size", () => {
    const query = parseMediaListQuery(new URLSearchParams("page=0&pageSize=999&search=%20badge%20&type=audio&tag=Speaking"));

    expect(query).toEqual({
      page: 1,
      pageSize: 60,
      search: "badge",
      type: "audio",
      tag: "Speaking",
    });
  });

  it("normalizes malformed numeric query parameters", () => {
    const query = parseMediaListQuery(new URLSearchParams("page=abc&pageSize=invalid"));

    expect(query.page).toBe(1);
    expect(query.pageSize).toBe(24);
  });

  it("computes navigation metadata without exposing an unbounded page", () => {
    const query = parseMediaListQuery(new URLSearchParams("page=10&pageSize=10"));
    const metadata = getMediaPaginationMeta(25, query);

    expect(metadata).toEqual({
      page: 3,
      pageSize: 10,
      total: 25,
      totalPages: 3,
      hasPreviousPage: true,
      hasNextPage: false,
    });
  });
});
