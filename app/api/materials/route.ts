import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { enrollments, materials, users } from "@/drizzle/schema";
import { eq, inArray, or } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    let visibleMaterials;

    if (session?.user?.email) {
      const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
      const privileged = user?.role === "admin" || user?.role === "professor";
      const enrolled = user ? await db.select({ courseId: enrollments.courseId }).from(enrollments).where(eq(enrollments.userId, user.id)) : [];
      const courseIds = enrolled.map((item) => item.courseId).filter((id): id is number => Number.isInteger(id));
      const accessFilter = privileged || courseIds.length > 0 ? or(eq(materials.isPublic, true), ...(privileged ? [] : [inArray(materials.courseId, courseIds)])) : eq(materials.isPublic, true);
      visibleMaterials = await db.select().from(materials).where(accessFilter).limit(100);
    } else {
      visibleMaterials = await db.select().from(materials).where(eq(materials.isPublic, true)).limit(100);
    }

    return NextResponse.json({ materials: visibleMaterials });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500 });
  }
}
