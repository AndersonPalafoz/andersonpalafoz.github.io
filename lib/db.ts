import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/drizzle/schema";
import * as relations from "@/drizzle/relations";
import { and, asc, desc, eq, inArray, isNull, isNotNull, or } from "drizzle-orm";
import { parseGoogleDriveLinks } from "@/lib/google-drive-links";
import {
  normalizeCourseType,
  validateCourseTypeFields,
  type SyncModality,
} from "@/lib/course-types";

// O template pode fornecer DATABASE_URL apontando para TiDB/MySQL. Esta aplicação
// usa Drizzle + postgres-js, portanto o DSN Neon precisa ter precedência.
const connectionString =
  process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "NEON_DATABASE_URL (or DATABASE_URL) environment variable is not set"
  );
}

if (
  !connectionString.startsWith("postgres://") &&
  !connectionString.startsWith("postgresql://")
) {
  throw new Error(
    "The database connection must use a PostgreSQL URL (postgres:// or postgresql://)"
  );
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
  return await db.query.courses.findMany({
    where: isNull(schema.courses.deletedAt),
  });
}

export async function getTrashCourses(instructorName?: string | null) {
  if (instructorName) {
    return await db.query.courses.findMany({
      where: and(
        isNotNull(schema.courses.deletedAt),
        eq(schema.courses.instructor, instructorName)
      ),
      orderBy: desc(schema.courses.deletedAt),
    });
  }
  return await db.query.courses.findMany({
    where: isNotNull(schema.courses.deletedAt),
    orderBy: desc(schema.courses.deletedAt),
  });
}

export async function getCourseById(id: number) {
  return await db.query.courses.findFirst({
    where: and(eq(schema.courses.id, id), isNull(schema.courses.deletedAt)),
  });
}

export async function restoreCourse(id: number) {
  const [updated] = await db
    .update(schema.courses)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(schema.courses.id, id))
    .returning();
  return updated;
}

export async function softDeleteCourse(id: number) {
  const [updated] = await db
    .update(schema.courses)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(schema.courses.id, id))
    .returning();
  return updated;
}

export async function getMaterials(instructorId?: number) {
  const conditions = [isNull(schema.materials.deletedAt)];
  if (instructorId)
    conditions.push(eq(schema.materials.instructorId, instructorId));
  return await db
    .select()
    .from(schema.materials)
    .where(and(...conditions))
    .orderBy(desc(schema.materials.createdAt));
}

export async function getMaterialById(id: number) {
  return await db.query.materials.findFirst({
    where: eq(schema.materials.id, id),
  });
}

export async function getRelatedMaterials(
  materialId: number,
  category: string,
  level: string,
  limit = 3
) {
  // Otimização para plano gratuito do Neon: limitar busca diretamente no SGBD por categoria/nível e excluir o id atual
  const rows = await db.query.materials.findMany({
    where: and(eq(schema.materials.isPublic, true)),
    orderBy: desc(schema.materials.createdAt),
    limit: 15,
  });
  return rows
    .filter(
      m => m.id !== materialId && (m.category === category || m.level === level)
    )
    .slice(0, limit);
}

export async function getSavedMaterialIds(
  userId: number,
  materialIds: number[]
) {
  if (materialIds.length === 0) return [];
  const rows = await db
    .select({ materialId: schema.savedMaterials.materialId })
    .from(schema.savedMaterials)
    .where(
      and(
        eq(schema.savedMaterials.userId, userId),
        inArray(schema.savedMaterials.materialId, materialIds)
      )
    );
  return rows.map(row => row.materialId);
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
  data: Partial<{
    name: string;
    phone: string;
    location: string;
    bio: string;
    avatarUrl: string;
  }>
) {
  return await db
    .update(schema.users)
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

export async function getCertificateByUserCourse(
  userId: number,
  courseId: number
) {
  return await db.query.certificates.findFirst({
    where: and(
      eq(schema.certificates.userId, userId),
      eq(schema.certificates.courseId, courseId)
    ),
    with: { course: true },
  });
}

export async function getAllCertificatesForAdmin() {
  return await db.query.certificates.findMany({
    with: { user: true, course: true },
    orderBy: desc(schema.certificates.issuedAt),
  });
}

export async function getCertificateTemplates(category?: string) {
  return await db.query.certificateTemplates.findMany({
    where: category
      ? eq(schema.certificateTemplates.category, category)
      : undefined,
    orderBy: [
      desc(schema.certificateTemplates.isDefault),
      asc(schema.certificateTemplates.name),
    ],
  });
}

export async function getCertificateTemplateById(id: number) {
  return await db.query.certificateTemplates.findFirst({
    where: eq(schema.certificateTemplates.id, id),
  });
}

export async function updateCertificateSignature(data: {
  certificateId: number;
  signatureType: schema.CertificateSignatureType;
  signedPdfUrl: string;
  signedAt: Date;
  signedBy: number;
}) {
  const [updated] = await db
    .update(schema.certificates)
    .set({
      signatureType: data.signatureType,
      signedPdfUrl: data.signedPdfUrl,
      signedAt: data.signedAt,
      signedBy: data.signedBy,
    })
    .where(eq(schema.certificates.id, data.certificateId))
    .returning();
  return updated;
}

export async function createCertificate(data: {
  userId: number;
  courseId: number;
  level: string;
  certificateCode: string;
  certificateUrl?: string;
  certificateTemplateId?: number | null;
  includeSiteBranding?: boolean;
}) {
  const existing = await getCertificateByUserCourse(data.userId, data.courseId);
  if (existing) return existing;
  const inserted = await db
    .insert(schema.certificates)
    .values(data)
    .returning();
  return inserted[0];
}

export async function getSpeakingAttempts(userId: number, activityId: number) {
  return await db.query.speakingAttempts.findMany({
    where: and(
      eq(schema.speakingAttempts.userId, userId),
      eq(schema.speakingAttempts.activityId, activityId)
    ),
    orderBy: desc(schema.speakingAttempts.attemptNumber),
  });
}

export async function createSpeakingAttempt(
  data: schema.InsertSpeakingAttempt
) {
  const attempts = await getSpeakingAttempts(data.userId, data.activityId);
  const attemptNumber =
    data.attemptNumber ??
    (attempts.length > 0
      ? Math.max(...attempts.map(item => item.attemptNumber)) + 1
      : 1);
  const inserted = await db
    .insert(schema.speakingAttempts)
    .values({ ...data, attemptNumber })
    .returning();
  return inserted[0];
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
    where: table => and(eq(table.userId, userId), eq(table.lessonId, lessonId)),
  });
}

export async function updateLessonProgress(
  userId: number,
  lessonId: number,
  completed: number
) {
  return await db
    .insert(schema.lessonProgress)
    .values({
      userId,
      lessonId,
      completed,
      completedAt: completed ? new Date() : null,
    })
    .onConflictDoUpdate({
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
    where: table => and(eq(table.userId, userId), eq(table.courseId, courseId)),
  });
}

export async function updateCourseProgress(
  userId: number,
  courseId: number,
  lessonsCompleted: number,
  totalLessons: number
) {
  const percentageCompleted =
    totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;
  const status =
    percentageCompleted === 100
      ? "completed"
      : percentageCompleted > 0
        ? "in_progress"
        : "pending";

  return await db
    .insert(schema.progress)
    .values({
      userId,
      courseId,
      lessonsCompleted,
      totalLessons,
      percentageCompleted,
      status: status as any,
    })
    .onConflictDoUpdate({
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
export type CourseWriteData = {
  title: string;
  description?: string;
  level: string;
  category?: string;
  modules?: number;
  instructor?: string;
  modality?: string;
  isFree?: boolean;
  price?: number;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  googleDriveLinks?: string | string[] | null;
  classDays?: string;
  classTime?: string;
  workloadHours?: number;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  maxAbsencePercent?: number;
  courseType?: number;
  externalRedirectUrl?: string | null;
  syncModality?: SyncModality;
};

function validateCourseWriteData(
  data: Pick<
    CourseWriteData,
    "courseType" | "externalRedirectUrl" | "syncModality"
  >
) {
  const error = validateCourseTypeFields(data);
  if (error) throw new Error(error);
}

export async function createCourse(data: CourseWriteData) {
  validateCourseWriteData(data);
  return await db
    .insert(schema.courses)
    .values({
      title: data.title,
      description: data.description,
      level: data.level,
      category: data.category,
      modules: data.modules || 0,
      instructor: data.instructor || "Anderson Palafoz",
      modality: data.modality || "individual",
      isFree: data.isFree ?? true,
      price: data.price !== undefined ? data.price.toFixed(2) : "0.00",
      imageUrl: data.imageUrl,
      audioUrl: data.audioUrl,
      videoUrl: data.videoUrl,
      googleDriveLinks:
        parseGoogleDriveLinks(data.googleDriveLinks).join("\n") || null,
      classDays: data.classDays,
      classTime: data.classTime,
      workloadHours: data.workloadHours,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      maxAbsencePercent: data.maxAbsencePercent,
      courseType: normalizeCourseType(data.courseType),
      externalRedirectUrl: data.externalRedirectUrl?.trim() || null,
      syncModality: data.syncModality || "none",
    })
    .returning();
}

export async function updateCourse(id: number, data: Partial<CourseWriteData>) {
  validateCourseWriteData(data);
  const {
    price,
    googleDriveLinks,
    startDate,
    endDate,
    courseType,
    externalRedirectUrl,
    syncModality,
    ...courseData
  } = data;
  return await db
    .update(schema.courses)
    .set({
      ...courseData,
      ...(price !== undefined ? { price: price.toFixed(2) } : {}),
      ...(googleDriveLinks !== undefined
        ? {
            googleDriveLinks:
              parseGoogleDriveLinks(googleDriveLinks).join("\n") || null,
          }
        : {}),
      ...(startDate !== undefined
        ? { startDate: startDate ? new Date(startDate) : null }
        : {}),
      ...(endDate !== undefined
        ? { endDate: endDate ? new Date(endDate) : null }
        : {}),
      ...(courseType !== undefined
        ? { courseType: normalizeCourseType(courseType) }
        : {}),
      ...(externalRedirectUrl !== undefined
        ? { externalRedirectUrl: externalRedirectUrl?.trim() || null }
        : {}),
      ...(syncModality !== undefined
        ? { syncModality: syncModality || "none" }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(schema.courses.id, id))
    .returning();
}

export async function deleteCourse(id: number) {
  return await db
    .delete(schema.courses)
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
  isPublic?: boolean;
  instructorId?: number;
}) {
  return await db
    .insert(schema.materials)
    .values({
      title: data.title,
      description: data.description,
      category: data.category,
      level: data.level,
      fileUrl: data.fileUrl,
      isPublic: data.isPublic ?? true,
      instructorId: data.instructorId,
    })
    .returning();
}

export async function updateMaterial(
  id: number,
  data: Partial<{
    title: string;
    description: string;
    category: string;
    level: string;
    fileUrl: string;
    isPublic: boolean;
  }>
) {
  return await db
    .update(schema.materials)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(schema.materials.id, id))
    .returning();
}

export async function deleteMaterial(id: number) {
  await db
    .delete(schema.materialProgress)
    .where(eq(schema.materialProgress.materialId, id));
  await db
    .delete(schema.savedMaterials)
    .where(eq(schema.savedMaterials.materialId, id));
  return await db
    .delete(schema.materials)
    .where(eq(schema.materials.id, id))
    .returning();
}

export async function incrementMaterialDownloads(id: number) {
  const material = await getMaterialById(id);
  if (!material) return null;

  return await db
    .update(schema.materials)
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
  return await db
    .insert(schema.articles)
    .values({
      title: data.title,
      slug: data.slug,
      content: data.content,
      category: data.category,
      readingTime: data.readingTime,
      published: data.published,
    })
    .returning();
}

export async function updateArticle(
  id: number,
  data: Partial<{
    title: string;
    slug: string;
    content: string;
    category: string;
    readingTime: number;
    published: Date;
  }>
) {
  return await db
    .update(schema.articles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(schema.articles.id, id))
    .returning();
}

export async function deleteArticle(id: number) {
  return await db
    .delete(schema.articles)
    .where(eq(schema.articles.id, id))
    .returning();
}

export async function publishArticle(id: number) {
  return await db
    .update(schema.articles)
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

  const activeUsers = usersCount.filter(user => !user.deletedAt);
  const completed = enrollmentsCount.filter(e => e.progress === 100);
  const avgProgress =
    enrollmentsCount.length > 0
      ? Math.round(
          enrollmentsCount.reduce((acc, e) => acc + (e.progress || 0), 0) /
            enrollmentsCount.length
        )
      : 0;

  const roleCounts = activeUsers.reduce(
    (counts, user) => {
      if (user.role === "admin") counts.admin += 1;
      else if (user.role === "professor") counts.professor += 1;
      else counts.student += 1;
      return counts;
    },
    { admin: 0, professor: 0, student: 0 }
  );

  const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);
  const monthlyActivity = Array.from({ length: 6 }, (_, index) => {
    const monthStart = new Date(currentMonth);
    monthStart.setMonth(currentMonth.getMonth() - (5 - index));
    const nextMonth = new Date(monthStart);
    nextMonth.setMonth(monthStart.getMonth() + 1);

    const enrollments = enrollmentsCount.filter(enrollment => {
      const date = new Date(enrollment.enrolledAt);
      return date >= monthStart && date < nextMonth;
    }).length;

    const activeUsers = usersCount.filter(user => {
      if (user.deletedAt) return false;
      const date = new Date(user.lastSignedIn);
      return date >= monthStart && date < nextMonth;
    }).length;

    const coursesCreated = coursesCount.filter(course => {
      if (course.deletedAt) return false;
      const date = new Date(course.createdAt || course.updatedAt);
      return date >= monthStart && date < nextMonth;
    }).length;

    return {
      month: monthFormatter.format(monthStart).replace(".", ""),
      enrollments,
      activeUsers,
      coursesCreated,
    };
  });

  return {
    totalCourses: coursesCount.filter(course => !course.deletedAt).length,
    totalMaterials: materialsCount.length,
    totalArticles: articlesCount.length,
    totalUsers: activeUsers.length,
    totalEnrollments: enrollmentsCount.length,
    completedCourses: completed.length,
    averageProgress: avgProgress,
    roleCounts,
    monthlyActivity,
  };
}

// Article Comments & Ratings helpers
export async function getArticleComments(articleId: number) {
  try {
    return await db
      .select()
      .from(schema.articleComments)
      .where(eq(schema.articleComments.articleId, articleId))
      .orderBy(desc(schema.articleComments.createdAt));
  } catch (err) {
    console.error("Error fetching article comments:", err);
    return [];
  }
}

export async function createArticleComment(data: {
  articleId: number;
  userName: string;
  userEmail?: string;
  rating: number;
  comment: string;
}) {
  return await db
    .insert(schema.articleComments)
    .values({
      articleId: data.articleId,
      userName: data.userName,
      userEmail: data.userEmail,
      rating: data.rating,
      comment: data.comment,
    })
    .returning();
}

export async function fulfillCoursePurchase(input: {
  userId: number;
  courseId: number;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId?: string | null;
  stripeCustomerId?: string | null;
}) {
  const insertedPurchase = await db
    .insert(schema.coursePurchases)
    .values({
      userId: input.userId,
      courseId: input.courseId,
      stripeCheckoutSessionId: input.stripeCheckoutSessionId,
      stripePaymentIntentId: input.stripePaymentIntentId || null,
      stripeCustomerId: input.stripeCustomerId || null,
      fulfilledAt: new Date(),
    })
    .onConflictDoNothing({
      target: schema.coursePurchases.stripeCheckoutSessionId,
    })
    .returning();

  const enrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(schema.enrollments.userId, input.userId),
      eq(schema.enrollments.courseId, input.courseId)
    ),
  });
  if (!enrollment) {
    await db
      .insert(schema.enrollments)
      .values({
        userId: input.userId,
        courseId: input.courseId,
        status: "active",
        enrolledAt: new Date(),
      })
      .onConflictDoNothing();
  }
  return {
    purchase: insertedPurchase[0] || null,
    alreadyFulfilled: insertedPurchase.length === 0,
  };
}

export async function getCoursePurchases(userId: number) {
  return db
    .select({ purchase: schema.coursePurchases, course: schema.courses })
    .from(schema.coursePurchases)
    .innerJoin(
      schema.courses,
      eq(schema.coursePurchases.courseId, schema.courses.id)
    )
    .where(eq(schema.coursePurchases.userId, userId))
    .orderBy(desc(schema.coursePurchases.createdAt));
}

export async function getResumeLesson(userId: number, courseId: number) {
  const courseModules = await db.query.modules.findMany({
    where: eq(schema.modules.courseId, courseId),
    orderBy: asc(schema.modules.order),
  });
  const lessonRows = [] as Array<typeof schema.lessons.$inferSelect>;
  for (const module of courseModules) {
    const moduleLessons = await db.query.lessons.findMany({
      where: eq(schema.lessons.moduleId, module.id),
      orderBy: asc(schema.lessons.order),
    });
    lessonRows.push(...moduleLessons);
  }
  if (lessonRows.length === 0) return null;
  const lessonIds = lessonRows.map(lesson => lesson.id);
  const completedRows = await db.query.lessonProgress.findMany({
    where: and(
      eq(schema.lessonProgress.userId, userId),
      inArray(schema.lessonProgress.lessonId, lessonIds)
    ),
  });
  const completedIds = new Set(
    completedRows.filter(row => row.completed === 1).map(row => row.lessonId)
  );
  const next =
    lessonRows.find(lesson => !completedIds.has(lesson.id)) ||
    lessonRows[lessonRows.length - 1];
  const completedLessons = lessonRows.filter(lesson =>
    completedIds.has(lesson.id)
  ).length;
  return {
    lesson: next,
    completedLessons,
    totalLessons: lessonRows.length,
    percentage: Math.round((completedLessons / lessonRows.length) * 100),
  };
}

// --- Materiais: Lixeira, Restauração e Exclusão Permanente ---

export async function getTrashMaterials(instructorId?: number) {
  const conditions = [isNotNull(schema.materials.deletedAt)];
  if (instructorId)
    conditions.push(eq(schema.materials.instructorId, instructorId));
  return await db
    .select()
    .from(schema.materials)
    .where(and(...conditions))
    .orderBy(desc(schema.materials.updatedAt));
}

export async function softDeleteMaterial(id: number) {
  return await db
    .update(schema.materials)
    .set({ deletedAt: new Date() })
    .where(eq(schema.materials.id, id))
    .returning();
}

export async function restoreMaterial(id: number) {
  return await db
    .update(schema.materials)
    .set({ deletedAt: null })
    .where(eq(schema.materials.id, id))
    .returning();
}

// --- Alunos/Usuários: Lixeira, Restauração e Exclusão Permanente ---
export async function getUsersList() {
  return await db
    .select()
    .from(schema.users)
    .where(isNull(schema.users.deletedAt))
    .orderBy(desc(schema.users.createdAt));
}

export async function getTrashUsers() {
  return await db
    .select()
    .from(schema.users)
    .where(isNotNull(schema.users.deletedAt))
    .orderBy(desc(schema.users.updatedAt));
}

export async function softDeleteUser(id: number) {
  return await db
    .update(schema.users)
    .set({ deletedAt: new Date() })
    .where(eq(schema.users.id, id))
    .returning();
}

export async function restoreUser(id: number) {
  return await db
    .update(schema.users)
    .set({ deletedAt: null })
    .where(eq(schema.users.id, id))
    .returning();
}

/**
 * Exclusão definitiva de um usuário e de todos os dados que pertencem
 * exclusivamente a ele. Roda em transação: ou tudo é limpo com sucesso e o
 * usuário é removido, ou nada é alterado.
 *
 * Antes de apagar qualquer coisa, verifica se o usuário é responsável por
 * conteúdo que pertence a OUTRAS pessoas (sessões de aula com chamada de
 * outros alunos, turmas externas com notas/materiais, concessões de acesso
 * ou cupons que ele criou). Nesses casos, a exclusão é bloqueada com uma
 * mensagem clara em vez de apagar ou corromper silenciosamente dados de
 * terceiros — é preciso reatribuir ou remover esse conteúdo primeiro.
 *
 * Tabelas com onDelete: "cascade" no schema (notifications, progresso de
 * materiais, gamificação, fórum, etc.) são limpas automaticamente pelo
 * próprio Postgres e não precisam de tratamento aqui.
 */
export async function deleteUserPermanently(id: number) {
  return await db.transaction(async (tx) => {
    const blockingChecks: Array<{
      rows: Array<{ id: number }>;
      message: string;
    }> = [
      {
        rows: await tx
          .select({ id: schema.classSessions.id })
          .from(schema.classSessions)
          .where(eq(schema.classSessions.teacherId, id))
          .limit(1),
        message:
          "Este usuário é professor de sessões de aula com chamada de outros alunos. Reatribua ou remova essas sessões antes de excluir definitivamente.",
      },
      {
        rows: await tx
          .select({ id: schema.externalClasses.id })
          .from(schema.externalClasses)
          .where(eq(schema.externalClasses.teacherId, id))
          .limit(1),
        message:
          "Este usuário é professor de turmas externas com alunos, notas ou materiais vinculados. Reatribua ou remova essas turmas antes de excluir definitivamente.",
      },
      {
        rows: await tx
          .select({ id: schema.manualAccessGrants.id })
          .from(schema.manualAccessGrants)
          .where(eq(schema.manualAccessGrants.grantedBy, id))
          .limit(1),
        message:
          "Este usuário concedeu acessos manuais a outras contas. Reatribua essas concessões antes de excluir definitivamente.",
      },
      {
        rows: await tx
          .select({ id: schema.coupons.id })
          .from(schema.coupons)
          .where(eq(schema.coupons.createdBy, id))
          .limit(1),
        message:
          "Este usuário criou cupons de desconto. Reatribua ou remova esses cupons antes de excluir definitivamente.",
      },
    ];

    for (const check of blockingChecks) {
      if (check.rows.length > 0) {
        throw new Error(check.message);
      }
    }

    // Referências de atribuição/autoria que podem ficar nulas sem perder o
    // registro principal (o registro em si pertence a outra entidade, não
    // ao usuário sendo excluído).
    await tx.update(schema.certificates).set({ signedBy: null }).where(eq(schema.certificates.signedBy, id));
    await tx.update(schema.lessonProgress).set({ approvedBy: null }).where(eq(schema.lessonProgress.approvedBy, id));
    await tx.update(schema.eventLogs).set({ userId: null }).where(eq(schema.eventLogs.userId, id));
    await tx.update(schema.userMedals).set({ awardedBy: null }).where(eq(schema.userMedals.awardedBy, id));
    await tx.update(schema.mediaAssets).set({ uploaderId: null }).where(eq(schema.mediaAssets.uploaderId, id));
    await tx.update(schema.forumPosts).set({ moderatedBy: null }).where(eq(schema.forumPosts.moderatedBy, id));
    await tx.update(schema.certificateTemplates).set({ createdBy: null }).where(eq(schema.certificateTemplates.createdBy, id));
    await tx.update(schema.materials).set({ instructorId: null }).where(eq(schema.materials.instructorId, id));

    // Dados pessoais que pertencem exclusivamente a este usuário.
    await tx.delete(schema.passwordResetTokens).where(eq(schema.passwordResetTokens.userId, id));
    await tx.delete(schema.progress).where(eq(schema.progress.userId, id));
    await tx.delete(schema.lessonProgress).where(eq(schema.lessonProgress.userId, id));
    await tx.delete(schema.userActivityProgress).where(eq(schema.userActivityProgress.userId, id));
    await tx.delete(schema.speakingAttempts).where(eq(schema.speakingAttempts.userId, id));
    await tx.delete(schema.wishlistItems).where(eq(schema.wishlistItems.userId, id));
    await tx.delete(schema.lessonNotes).where(eq(schema.lessonNotes.userId, id));
    await tx.delete(schema.courseReviews).where(eq(schema.courseReviews.userId, id));
    await tx.delete(schema.courseReviewReplies).where(eq(schema.courseReviewReplies.authorId, id));
    await tx.delete(schema.articleCommentReplies).where(eq(schema.articleCommentReplies.authorId, id));
    await tx
      .delete(schema.directMessages)
      .where(or(eq(schema.directMessages.senderId, id), eq(schema.directMessages.receiverId, id)));
    await tx.delete(schema.attendances).where(eq(schema.attendances.studentId, id));
    await tx.delete(schema.enrollments).where(eq(schema.enrollments.userId, id));
    await tx.delete(schema.certificates).where(eq(schema.certificates.userId, id));
    await tx.delete(schema.coursePurchases).where(eq(schema.coursePurchases.userId, id));

    return await tx.delete(schema.users).where(eq(schema.users.id, id)).returning();
  });
}

/**
 * Métricas comerciais e acadêmicas para o painel administrativo.
 * As compras representam pagamentos confirmados pelo webhook do Stripe;
 * nenhum valor é inventado quando não existem registros.
 */
export async function getAdminCommerceStats() {
  try {
    const purchases = await db
      .select({
        id: schema.coursePurchases.id,
        courseId: schema.coursePurchases.courseId,
        courseTitle: schema.courses.title,
        coursePrice: schema.courses.price,
        studentId: schema.coursePurchases.userId,
        studentName: schema.users.name,
        studentEmail: schema.users.email,
        purchasedAt: schema.coursePurchases.fulfilledAt,
        createdAt: schema.coursePurchases.createdAt,
      })
      .from(schema.coursePurchases)
      .innerJoin(
        schema.courses,
        eq(schema.coursePurchases.courseId, schema.courses.id)
      )
      .innerJoin(
        schema.users,
        eq(schema.coursePurchases.userId, schema.users.id)
      )
      .orderBy(desc(schema.coursePurchases.createdAt));

    const enrollments = await db
      .select({
        id: schema.enrollments.id,
        courseId: schema.enrollments.courseId,
        courseTitle: schema.courses.title,
        studentId: schema.enrollments.userId,
        studentName: schema.users.name,
        studentEmail: schema.users.email,
        progress: schema.enrollments.progress,
        status: schema.enrollments.status,
        enrolledAt: schema.enrollments.enrolledAt,
      })
      .from(schema.enrollments)
      .innerJoin(
        schema.courses,
        eq(schema.enrollments.courseId, schema.courses.id)
      )
      .innerJoin(schema.users, eq(schema.enrollments.userId, schema.users.id))
      .orderBy(desc(schema.enrollments.enrolledAt));

    const totalRevenue = purchases.reduce(
      (sum, purchase) => sum + Number(purchase.coursePrice || 0),
      0
    );
    const uniqueBuyers = new Set(purchases.map(purchase => purchase.studentId))
      .size;
    const courseAggregation = new Map<
      number,
      { courseId: number; title: string; purchases: number; revenue: number }
    >();

    for (const purchase of purchases) {
      const current = courseAggregation.get(purchase.courseId) || {
        courseId: purchase.courseId,
        title: purchase.courseTitle,
        purchases: 0,
        revenue: 0,
      };
      current.purchases += 1;
      current.revenue += Number(purchase.coursePrice || 0);
      courseAggregation.set(purchase.courseId, current);
    }

    return {
      commerceAvailable: true,
      salesSummary: {
        totalPurchases: purchases.length,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        currency: "BRL",
        revenueBasis: "current_course_price" as const,
        uniqueBuyers,
        totalEnrollments: enrollments.length,
      },
      topSellingCourses: Array.from(courseAggregation.values())
        .sort((a, b) => b.purchases - a.purchases || b.revenue - a.revenue)
        .slice(0, 5),
      recentPurchases: purchases.slice(0, 20).map(purchase => ({
        id: purchase.id,
        courseId: purchase.courseId,
        courseTitle: purchase.courseTitle,
        studentId: purchase.studentId,
        studentName: purchase.studentName || "Aluno sem nome informado",
        studentEmail: purchase.studentEmail || "E-mail não informado",
        amount: Number(Number(purchase.coursePrice || 0).toFixed(2)),
        status: "paid" as const,
        purchasedAt: purchase.purchasedAt || purchase.createdAt,
      })),
      recentEnrollments: enrollments.slice(0, 30).map(enrollment => ({
        id: enrollment.id,
        courseId: enrollment.courseId,
        courseTitle: enrollment.courseTitle,
        studentId: enrollment.studentId,
        studentName: enrollment.studentName || "Aluno sem nome informado",
        studentEmail: enrollment.studentEmail || "E-mail não informado",
        progress: enrollment.progress || 0,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
      })),
    };
  } catch (error) {
    console.error("Error fetching admin commerce stats:", error);
    return {
      commerceAvailable: false,
      salesSummary: {
        totalPurchases: 0,
        totalRevenue: 0,
        currency: "BRL",
        revenueBasis: "unavailable" as const,
        uniqueBuyers: 0,
        totalEnrollments: 0,
      },
      topSellingCourses: [],
      recentPurchases: [],
      recentEnrollments: [],
    };
  }
}
