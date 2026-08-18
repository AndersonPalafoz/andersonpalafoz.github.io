export const MEDIA_PAGE_SIZE_DEFAULT = 24;
export const MEDIA_PAGE_SIZE_MAX = 60;

export type MediaListQuery = {
  page: number;
  pageSize: number;
  search: string;
  type: string;
  tag: string;
};

export function parseMediaListQuery(searchParams: URLSearchParams): MediaListQuery {
  const parsedPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const parsedPageSize = Number.parseInt(searchParams.get("pageSize") ?? String(MEDIA_PAGE_SIZE_DEFAULT), 10);

  return {
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    pageSize: Number.isFinite(parsedPageSize)
      ? Math.min(Math.max(parsedPageSize, 1), MEDIA_PAGE_SIZE_MAX)
      : MEDIA_PAGE_SIZE_DEFAULT,
    search: (searchParams.get("search") ?? "").trim().slice(0, 100),
    type: (searchParams.get("type") ?? "").trim().slice(0, 64),
    tag: (searchParams.get("tag") ?? "").trim().slice(0, 64),
  };
}

export function getMediaPaginationMeta(total: number, query: MediaListQuery) {
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  return {
    page: Math.min(query.page, totalPages),
    pageSize: query.pageSize,
    total,
    totalPages,
    hasPreviousPage: query.page > 1,
    hasNextPage: query.page < totalPages,
  };
}
