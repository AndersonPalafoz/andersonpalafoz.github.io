import { db } from "@/lib/db";
import { activities, courses, materials, users, enrollments } from "@/drizzle/schema";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";

type TeacherUser = typeof users.$inferSelect;
type CourseRow = typeof courses.$inferSelect;

async function getTeacherUser(userEmail?: string) {
  return userEmail ? (await db.query.users.findFirst({ where: eq(users.email, userEmail) })) ?? null : null;
}

function courseBelongsToTeacher(course: CourseRow, teacher: TeacherUser | null) {
  if (!teacher || teacher.role !== "professor") return true;
  const teacherName = teacher.name?.trim();
  return course.instructor === "Anderson Palafoz" || (Boolean(teacherName) && course.instructor === teacherName);
}

export async function getTeacherDashboardData(userEmail?: string) {
  const teacher = await getTeacherUser(userEmail);
  const [allCourses, allMaterials, allActivities, activeStudents, allEnrollments] = await Promise.all([
    db.query.courses.findMany({ where: isNull(courses.deletedAt), orderBy: desc(courses.updatedAt) }),
    db.query.materials.findMany({ orderBy: desc(materials.updatedAt) }),
    db.query.activities.findMany({ with: { course: true }, orderBy: desc(activities.createdAt) }),
    db.query.users.findMany({ where: and(eq(users.role, "user"), eq(users.approvalStatus, "approved"), isNull(users.deletedAt)), orderBy: desc(users.lastSignedIn) }),
    db.query.enrollments.findMany(),
  ]);

  const visibleCourses = allCourses.filter((course) => courseBelongsToTeacher(course, teacher));
  const courseIds = new Set(visibleCourses.map((course) => course.id));
  const visibleMaterials = teacher?.role === "professor" ? allMaterials.filter((material) => material.courseId === null || courseIds.has(material.courseId)) : allMaterials;
  const visibleActivities = teacher?.role === "professor" ? allActivities.filter((activity) => courseIds.has(activity.courseId)) : allActivities;
  const visibleEnrollments = teacher?.role === "professor" ? allEnrollments.filter((enrollment) => courseIds.has(enrollment.courseId)) : allEnrollments;
  const visibleStudentIds = new Set(visibleEnrollments.map((enrollment) => enrollment.userId));
  const visibleStudents = teacher?.role === "professor" ? activeStudents.filter((student) => visibleStudentIds.has(student.id)) : activeStudents;

  return {
    stats: { totalCourses: visibleCourses.length, totalStudents: visibleStudents.length, totalMaterials: visibleMaterials.length, totalActivities: visibleActivities.length, totalEnrollments: visibleEnrollments.length },
    recentCourses: visibleCourses.slice(0, 5),
    recentMaterials: visibleMaterials.slice(0, 5),
    recentActivities: visibleActivities.slice(0, 5),
    recentStudents: visibleStudents.slice(0, 5),
  };
}

export async function getTeacherCourses(userEmail?: string) {
  const teacher = await getTeacherUser(userEmail);
  const rows = await db.query.courses.findMany({ where: isNull(courses.deletedAt), orderBy: desc(courses.updatedAt) });
  return rows.filter((course) => courseBelongsToTeacher(course, teacher));
}

export async function getTeacherStudents(userEmail?: string) {
  const teacher = await getTeacherUser(userEmail);
  const rows = await db.query.users.findMany({ where: and(eq(users.role, "user"), isNull(users.deletedAt)), orderBy: desc(users.lastSignedIn) });
  if (teacher?.role !== "professor") return rows;
  const visibleCourses = (await db.query.courses.findMany({ where: isNull(courses.deletedAt) })).filter((course) => courseBelongsToTeacher(course, teacher));
  const visibleCourseIds = visibleCourses.map((course) => course.id);
  if (visibleCourseIds.length === 0) return [];
  const teacherEnrollments = await db.query.enrollments.findMany({ where: inArray(enrollments.courseId, visibleCourseIds) });
  const studentIds = new Set(teacherEnrollments.map((enrollment) => enrollment.userId));
  return rows.filter((student) => studentIds.has(student.id));
}

export async function getTeacherMaterials(userEmail?: string) {
  const teacher = await getTeacherUser(userEmail);
  const rows = await db.query.materials.findMany({ orderBy: desc(materials.updatedAt) });
  if (teacher?.role !== "professor") return rows;
  const visibleCourses = (await db.query.courses.findMany({ where: isNull(courses.deletedAt) })).filter((course) => courseBelongsToTeacher(course, teacher));
  const visibleCourseIds = new Set(visibleCourses.map((course) => course.id));
  return rows.filter((material) => material.courseId === null || visibleCourseIds.has(material.courseId));
}

export async function getTeacherActivities(userEmail?: string) {
  const teacher = await getTeacherUser(userEmail);
  const rows = await db.query.activities.findMany({ with: { course: true }, orderBy: desc(activities.createdAt) });
  if (teacher?.role !== "professor") return rows;
  const visibleCourses = (await db.query.courses.findMany({ where: isNull(courses.deletedAt) })).filter((course) => courseBelongsToTeacher(course, teacher));
  const visibleCourseIds = new Set(visibleCourses.map((course) => course.id));
  return rows.filter((activity) => visibleCourseIds.has(activity.courseId));
}

export type TeacherDashboardData = Awaited<ReturnType<typeof getTeacherDashboardData>>;
