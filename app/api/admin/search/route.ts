import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, courses } from "@/drizzle/schema";
import { desc, isNull } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [allUsers, allCourses] = await Promise.all([
      db.query.users.findMany({
        where: isNull(users.deletedAt),
        orderBy: desc(users.lastSignedIn),
      }),
      db.query.courses.findMany({
        orderBy: desc(courses.updatedAt),
      }),
    ]);

    return NextResponse.json({
      users: allUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        approvalStatus: u.approvalStatus,
        lastSignedIn: u.lastSignedIn,
      })),
      courses: allCourses.map((c) => ({
        id: c.id,
        title: c.title,
        level: c.level,
        modules: c.modules,
        category: c.category,
      })),
    });
  } catch (error) {
    console.error("Error in admin search API:", error);
    return NextResponse.json({ error: "Failed to fetch admin search data" }, { status: 500 });
  }
}
