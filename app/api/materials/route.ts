import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { enrollments, materials, users } from "@/drizzle/schema";
import { and, asc, count, eq, ilike, inArray, or } from "drizzle-orm";

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 60;

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let accessFilter;

    if (session?.user?.email) {
      const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
      const privileged = user?.role === "admin" || user?.role === "professor";
      const enrolled = user ? await db.select({ courseId: enrollments.courseId }).from(enrollments).where(eq(enrollments.userId, user.id)) : [];
      const courseIds = enrolled.map((item) => item.courseId).filter((id): id is number => Number.isInteger(id));
      accessFilter = privileged || courseIds.length > 0
        ? or(eq(materials.isPublic, true), ...(privileged ? [] : [inArray(materials.courseId, courseIds)]))
        : eq(materials.isPublic, true);
    } else {
      accessFilter = eq(materials.isPublic, true);
    }

    const search = request.nextUrl.searchParams.get("search")?.trim().slice(0, 120) || "";
    const level = request.nextUrl.searchParams.get("level")?.trim().slice(0, 80) || "";
    const category = request.nextUrl.searchParams.get("category")?.trim().slice(0, 80) || "";
    const page = parsePositiveInteger(request.nextUrl.searchParams.get("page"), 1);
    const pageSize = Math.min(parsePositiveInteger(request.nextUrl.searchParams.get("pageSize"), DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
    const filters = [
      accessFilter,
      search ? or(ilike(materials.title, `%${search}%`), ilike(materials.description, `%${search}%`)) : undefined,
      level ? eq(materials.level, level) : undefined,
      category ? eq(materials.category, category) : undefined,
    ].filter(Boolean);
    const where = and(...filters);

    const [rows, [{ total }], levels, categories] = await Promise.all([
      db.select({
        id: materials.id,
        title: materials.title,
        description: materials.description,
        category: materials.category,
        level: materials.level,
      }).from(materials).where(where).orderBy(asc(materials.title), asc(materials.id)).limit(pageSize + 1).offset((page - 1) * pageSize),
      db.select({ total: count() }).from(materials).where(where),
      db.select({ value: materials.level }).from(materials).where(accessFilter).groupBy(materials.level).orderBy(asc(materials.level)),
      db.select({ value: materials.category }).from(materials).where(accessFilter).groupBy(materials.category).orderBy(asc(materials.category)),
    ]);

    const cacheControl = session?.user?.email ? "private, no-store" : "public, max-age=30, stale-while-revalidate=120";
    return NextResponse.json({
      materials: rows.slice(0, pageSize),
      meta: { page, pageSize, total: Number(total), hasMore: rows.length > pageSize },
      facets: {
        levels: levels.map(({ value }) => value).filter((value): value is string => Boolean(value)),
        categories: categories.map(({ value }) => value).filter((value): value is string => Boolean(value)),
      },
    }, { headers: { "Cache-Control": cacheControl } });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
