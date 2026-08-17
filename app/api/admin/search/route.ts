import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, courses } from "@/drizzle/schema";
import { desc, isNull, or, ilike, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = 10; // Otimizado para proteger o Neon com paginação estrita
    const offset = (page - 1) * pageSize;

    const searchTerm = `%${query}%`;

    let dbUsers: any[] = [];
    let dbCourses: any[] = [];
    let totalUsers = 0;
    let totalCourses = 0;

    if (category === "all" || category === "teachers" || category === "students") {
      const userWhere = query
        ? andCondition(isNull(users.deletedAt), or(ilike(users.name, searchTerm), ilike(users.email, searchTerm)))
        : isNull(users.deletedAt);

      dbUsers = await db.query.users.findMany({
        where: userWhere,
        orderBy: desc(users.lastSignedIn),
        limit: pageSize,
        offset: offset,
      });

      const countRes = await db.select({ count: sql<number>`count(*)` }).from(users).where(userWhere);
      totalUsers = Number(countRes[0]?.count || 0);
    }

    if (category === "all" || category === "courses") {
      const courseWhere = query ? or(ilike(courses.title, searchTerm), ilike(courses.level, searchTerm)) : undefined;

      dbCourses = await db.query.courses.findMany({
        where: courseWhere,
        orderBy: desc(courses.updatedAt),
        limit: pageSize,
        offset: offset,
      });

      const countRes = await db.select({ count: sql<number>`count(*)` }).from(courses).where(courseWhere);
      totalCourses = Number(countRes[0]?.count || 0);
    }

    return NextResponse.json({
      users: dbUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        approvalStatus: u.approvalStatus,
        lastSignedIn: u.lastSignedIn,
      })),
      courses: dbCourses.map((c) => ({
        id: c.id,
        title: c.title,
        level: c.level,
        modules: c.modules,
        category: c.category,
      })),
      pagination: {
        page,
        pageSize,
        totalUsers,
        totalCourses,
      },
    });
  } catch (error) {
    console.error("Error in optimized admin search API:", error);
    return NextResponse.json({ error: "Failed to fetch paginated admin search data" }, { status: 500 });
  }
}

function andCondition(condition1: any, condition2: any) {
  return sql`${condition1} AND ${condition2}`;
}
