import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { activities, courses, materials, users } from "@/drizzle/schema";

export async function getTeacherDashboardData() {
  const [allCourses, allMaterials, allActivities, activeStudents, allEnrollments] = await Promise.all([
    db.query.courses.findMany({
      orderBy: desc(courses.updatedAt),
    }),
    db.query.materials.findMany({
      orderBy: desc(materials.updatedAt),
    }),
    db.query.activities.findMany({
      with: { course: true },
      orderBy: desc(activities.createdAt),
    }),
    db.query.users.findMany({
      where: and(
        eq(users.role, "user"),
        eq(users.approvalStatus, "approved"),
        isNull(users.deletedAt),
      ),
      orderBy: desc(users.lastSignedIn),
    }),
    db.query.enrollments.findMany(),
  ]);

  return {
    stats: {
      totalCourses: allCourses.length,
      totalStudents: activeStudents.length,
      totalMaterials: allMaterials.length,
      totalActivities: allActivities.length,
      totalEnrollments: allEnrollments.length,
    },
    recentCourses: allCourses.slice(0, 5),
    recentMaterials: allMaterials.slice(0, 5),
    recentActivities: allActivities.slice(0, 5),
    recentStudents: activeStudents.slice(0, 5),
  };
}

export async function getTeacherCourses() {
  return db.query.courses.findMany({ orderBy: desc(courses.updatedAt) });
}

export async function getTeacherStudents() {
  return db.query.users.findMany({
    where: and(eq(users.role, "user"), isNull(users.deletedAt)),
    orderBy: desc(users.lastSignedIn),
  });
}

export async function getTeacherMaterials() {
  return db.query.materials.findMany({ orderBy: desc(materials.updatedAt) });
}

export async function getTeacherActivities() {
  return db.query.activities.findMany({
    with: { course: true },
    orderBy: desc(activities.createdAt),
  });
}

export type TeacherDashboardData = Awaited<ReturnType<typeof getTeacherDashboardData>>;
