import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/drizzle/schema";
import * as relations from "@/drizzle/relations";
import { eq, desc } from "drizzle-orm";

// O template pode fornecer DATABASE_URL apontando para TiDB/MySQL. Esta aplicação
// usa Drizzle + postgres-js, portanto o DSN Neon precisa ter precedência.
const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("NEON_DATABASE_URL (or DATABASE_URL) environment variable is not set");
}

if (!connectionString.startsWith("postgres://") && !connectionString.startsWith("postgresql://")) {
  throw new Error("The database connection must use a PostgreSQL URL (postgres:// or postgresql://)");
}

// Create the connection
// prepare: false e necessario porque a connection string do Neon usada
// em producao e do endpoint "-pooler" (PgBouncer em modo transaction
// pooling). Nesse modo, prepared statements (que o driver `postgres`
// usa por padrao) nao sao confiaveis -- cada query pode ser roteada
// para uma conexao fisica diferente do pool, onde o statement nunca
// foi de fato preparado. Isso causava falhas intermitentes (algumas
// queries funcionavam, outras nao, sem padrao aparente).
const client = postgres(connectionString, { prepare: false });

// Create the database instance
export const db = drizzle(client, { schema: { ...schema, ...relations } });

export type Database = typeof db;

// Query Helpers
export async function getCourses() {
  return await db.query.courses.findMany();
}

export async function getCourseById(id: number) {
  return await db.query.courses.findFirst({
    where: eq(schema.courses.id, id),
  });
}

export async function getMaterials() {
  return await db.query.materials.findMany({
    orderBy: desc(schema.materials.createdAt),
  });
}

export async function getMaterialById(id: number) {
  return await db.query.materials.findFirst({
    where: eq(schema.materials.id, id),
  });
}

export async function getArticles() {
  return await db.query.articles.findMany({
    orderBy: desc(schema.articles.published),
  });
}

export async function getArticleBySlug(slug: string) {
  return await db.query.articles.findFirst({
    where: eq(schema.articles.slug, slug),
  });
}

export async function getUserByEmail(email: string) {
  return await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });
}

export async function updateUserProfile(
  userId: number,
  data: Partial<{ name: string; phone: string; location: string; bio: string; avatarUrl: string }>
) {
  return await db.update(schema.users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.users.id, userId))
    .returning();
}

export async function getUserEnrollments(userId: number) {
  return await db.query.enrollments.findMany({
    where: eq(schema.enrollments.userId, userId),
    with: {
      course: true,
    },
  });
}

export async function enrollUser(userId: number, courseId: number) {
  return await db.insert(schema.enrollments).values({
    userId,
    courseId,
    progress: 0,
    currentModule: 0,
    status: "active",
  });
}

export async function getActivities(courseId: number) {
  return await db.query.activities.findMany({
    where: eq(schema.activities.courseId, courseId),
  });
}

export async function getUserActivityProgress(userId: number) {
  return await db.query.userActivityProgress.findMany({
    where: eq(schema.userActivityProgress.userId, userId),
    with: {
      activity: true,
    },
  });
}

export async function getCertificates(userId: number) {
  return await db.query.certificates.findMany({
    where: eq(schema.certificates.userId, userId),
    with: {
      course: true,
    },
  });
}

// Modules and Lessons helpers
export async function getModulesByCourse(courseId: number) {
  return await db.query.modules.findMany({
    where: eq(schema.modules.courseId, courseId),
    orderBy: schema.modules.order,
  });
}

export async function getModuleById(id: number) {
  return await db.query.modules.findFirst({
    where: eq(schema.modules.id, id),
  });
}

export async function getLessonsByModule(moduleId: number) {
  return await db.query.lessons.findMany({
    where: eq(schema.lessons.moduleId, moduleId),
    orderBy: schema.lessons.order,
  });
}

export async function getLessonById(id: number) {
  return await db.query.lessons.findFirst({
    where: eq(schema.lessons.id, id),
  });
}

export async function getUserLessonProgress(userId: number, lessonId: number) {
  return await db.query.lessonProgress.findFirst({
    where: (table) => {
      return eq(table.userId, userId) && eq(table.lessonId, lessonId);
    },
  });
}

export async function updateLessonProgress(userId: number, lessonId: number, completed: number) {
  return await db.insert(schema.lessonProgress).values({
    userId,
    lessonId,
    completed,
    completedAt: completed ? new Date() : null,
  }).onConflictDoUpdate({
    target: [schema.lessonProgress.userId, schema.lessonProgress.lessonId],
    set: {
      completed,
      completedAt: completed ? new Date() : null,
      updatedAt: new Date(),
    },
  });
}

// Progress helpers
export async function getUserProgress(userId: number, courseId: number) {
  return await db.query.progress.findFirst({
    where: (table) => {
      return eq(table.userId, userId) && eq(table.courseId, courseId);
    },
  });
}

export async function updateCourseProgress(userId: number, courseId: number, lessonsCompleted: number, totalLessons: number) {
  const percentageCompleted = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;
  const status = percentageCompleted === 100 ? 'completed' : percentageCompleted > 0 ? 'in_progress' : 'pending';
  
  return await db.insert(schema.progress).values({
    userId,
    courseId,
    lessonsCompleted,
    totalLessons,
    percentageCompleted,
    status: status as any,
  }).onConflictDoUpdate({
    target: [schema.progress.userId, schema.progress.courseId],
    set: {
      lessonsCompleted,
      totalLessons,
      percentageCompleted,
      status: status as any,
      updatedAt: new Date(),
    },
  });
}

// Admin CRUD helpers for Courses
export async function createCourse(data: {
  title: string;
  description?: string;
  level: string;
  modules?: number;
  instructor?: string;
}) {
  return await db.insert(schema.courses).values({
    title: data.title,
    description: data.description,
    level: data.level,
    modules: data.modules || 0,
    instructor: data.instructor || "Anderson Palafoz",
  }).returning();
}

export async function updateCourse(id: number, data: Partial<{
  title: string;
  description: string;
  level: string;
  modules: number;
  instructor: string;
}>) {
  return await db.update(schema.courses)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(schema.courses.id, id))
    .returning();
}

export async function deleteCourse(id: number) {
  return await db.delete(schema.courses)
    .where(eq(schema.courses.id, id))
    .returning();
}

// Admin CRUD helpers for Materials
export async function createMaterial(data: {
  title: string;
  description?: string;
  category: string;
  level: string;
  fileUrl?: string;
}) {
  return await db.insert(schema.materials).values({
    title: data.title,
    description: data.description,
    category: data.category,
    level: data.level,
    fileUrl: data.fileUrl,
  }).returning();
}

export async function updateMaterial(id: number, data: Partial<{
  title: string;
  description: string;
  category: string;
  level: string;
  fileUrl: string;
}>) {
  return await db.update(schema.materials)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(schema.materials.id, id))
    .returning();
}

export async function deleteMaterial(id: number) {
  return await db.delete(schema.materials)
    .where(eq(schema.materials.id, id))
    .returning();
}

export async function incrementMaterialDownloads(id: number) {
  const material = await getMaterialById(id);
  if (!material) return null;
  
  return await db.update(schema.materials)
    .set({
      downloads: material.downloads + 1,
    })
    .where(eq(schema.materials.id, id))
    .returning();
}

// Admin CRUD helpers for Articles
export async function createArticle(data: {
  title: string;
  slug: string;
  content?: string;
  category?: string;
  readingTime?: number;
  published?: Date;
}) {
  return await db.insert(schema.articles).values({
    title: data.title,
    slug: data.slug,
    content: data.content,
    category: data.category,
    readingTime: data.readingTime,
    published: data.published,
  }).returning();
}

export async function updateArticle(id: number, data: Partial<{
  title: string;
  slug: string;
  content: string;
  category: string;
  readingTime: number;
  published: Date;
}>) {
  return await db.update(schema.articles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(schema.articles.id, id))
    .returning();
}

export async function deleteArticle(id: number) {
  return await db.delete(schema.articles)
    .where(eq(schema.articles.id, id))
    .returning();
}

export async function publishArticle(id: number) {
  return await db.update(schema.articles)
    .set({
      published: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.articles.id, id))
    .returning();
}

// Admin dashboard statistics
export async function getAdminStats() {
  const coursesCount = await db.query.courses.findMany();
  const materialsCount = await db.query.materials.findMany();
  const articlesCount = await db.query.articles.findMany();
  const usersCount = await db.query.users.findMany();
  const enrollmentsCount = await db.query.enrollments.findMany();

  return {
    totalCourses: coursesCount.length,
    totalMaterials: materialsCount.length,
    totalArticles: articlesCount.length,
    totalUsers: usersCount.length,
    totalEnrollments: enrollmentsCount.length,
  };
}
