import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { courses, externalClasses, materials, users } from "@/drizzle/schema";
import { isNotNull, and, eq } from "drizzle-orm";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = admin.user.email?.toLowerCase();
    const isGlobal = email === "palafozanderson@gmail.com" || admin.user.role === "admin" || admin.user.role === "super_admin";
    const instructorFilter = !isGlobal ? admin.user.name || email : null;

    let trashCoursesCount = 0;
    let trashClassesCount = 0;
    let trashMaterialsCount = 0;

    if (instructorFilter) {
      const cList = await db.query.courses.findMany({
        where: and(isNotNull(courses.deletedAt), eq(courses.instructor, instructorFilter)),
      });
      trashCoursesCount = cList.length;

      const userDb = await db.query.users.findFirst({ where: eq(users.email, email || "") });
      if (userDb) {
        const clList = await db.query.externalClasses.findMany({
          where: and(isNotNull(externalClasses.deletedAt), eq(externalClasses.teacherId, userDb.id)),
        });
        trashClassesCount = clList.length;
      }

      const mList = await db.query.materials.findMany({
        where: isNotNull(materials.deletedAt),
      });
      trashMaterialsCount = mList.length;
    } else {
      const cList = await db.query.courses.findMany({
        where: isNotNull(courses.deletedAt),
      });
      trashCoursesCount = cList.length;

      const clList = await db.query.externalClasses.findMany({
        where: isNotNull(externalClasses.deletedAt),
      });
      trashClassesCount = clList.length;

      const mList = await db.query.materials.findMany({
        where: isNotNull(materials.deletedAt),
      });
      trashMaterialsCount = mList.length;
    }

    const totalTrash = trashCoursesCount + trashClassesCount + trashMaterialsCount;
    return NextResponse.json({ total: totalTrash, courses: trashCoursesCount, classes: trashClassesCount, materials: trashMaterialsCount });
  } catch (error) {
    console.error("Erro ao computar contagem da lixeira:", error);
    return NextResponse.json({ total: 0, courses: 0, classes: 0, materials: 0 });
  }
}
