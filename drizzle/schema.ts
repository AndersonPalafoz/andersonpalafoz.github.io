import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  uniqueIndex,
  jsonb,
  numeric,
} from "drizzle-orm/pg-core";

// Enums
// Nota: a migração 0003_skinny_vermin.sql adicionou 'professor' ao enum no banco.
// Nenhuma rota/UI usa esse valor ainda -- apenas alinhando o schema TS à realidade do banco.
export const roleEnum = pgEnum("role", ["user", "professor", "admin"]);
export const approvalStatusEnum = pgEnum("approval_status", [
  "pending",
  "approved",
  "rejected",
]);
export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "active",
  "completed",
  "paused",
  "cancelled",
]);
export const activityTypeEnum = pgEnum("activity_type", [
  "quiz",
  "exercise",
  "assignment",
  "speaking",
  "listening",
]);
export const progressStatusEnum = pgEnum("progress_status", [
  "pending",
  "in_progress",
  "completed",
]);
export const lessonProgressApprovalStatusEnum = pgEnum(
  "lesson_progress_approval_status",
  ["pending", "approved", "rejected"]
);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: text("passwordHash"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").notNull().default("user"), // user, professor, admin
  requestedRole: varchar("requestedRole", { length: 32 }).default("student"), // student, professor
  approvalStatus: approvalStatusEnum("approvalStatus")
    .notNull()
    .default("pending"), // pending, approved, rejected
  phone: varchar("phone", { length: 32 }), // celular
  location: varchar("location", { length: 120 }),
  bio: text("bio"),
  teacherId: integer("teacherId"),
  /** URL/key do avatar armazenado externamente; nenhum byte de imagem é salvo no banco. */
  avatarUrl: varchar("avatarUrl", { length: 1000 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  /** Soft delete: mantém o histórico do usuário e permite recuperação pelo super-admin. */
  deletedAt: timestamp("deletedAt"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

/**
 * Courses table - Cursos disponíveis na plataforma
 */
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  level: varchar("level", { length: 10 }).notNull(), // A1, A2, B1, B2, C1, C2
  category: varchar("category", { length: 120 }),
  modules: integer("modules").default(0),
  instructor: varchar("instructor", { length: 255 }).default(
    "Anderson Palafoz"
  ),
  modality: varchar("modality", { length: 32 }).default("individual"),
  isFree: boolean("isFree").default(true).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).default("0"),
  imageUrl: varchar("imageUrl", { length: 1000 }),
  audioUrl: varchar("audioUrl", { length: 1000 }),
  videoUrl: varchar("videoUrl", { length: 1000 }),
  stripeProductId: varchar("stripeProductId", { length: 255 }),
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  /** Links externos de materiais complementares hospedados no Google Drive. */
  googleDriveLinks: text("googleDriveLinks"),
  classDays: varchar("class_days", { length: 255 }),
  classTime: varchar("class_time", { length: 100 }),
  workloadHours: integer("workload_hours").default(40),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  maxAbsencePercent: integer("max_absence_percent").default(25),
  courseType: integer("course_type").default(1).notNull(),
  externalRedirectUrl: varchar("external_redirect_url", { length: 1000 }),
  syncModality: varchar("sync_modality", { length: 64 }).default("none"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

/**
 * Purchases are local fulfillment references; payment state and receipt details remain in Stripe.
 */
export const coursePurchases = pgTable("course_purchases", {
  id: serial("id").primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id),
  courseId: integer("courseId")
    .notNull()
    .references(() => courses.id),
  stripeCheckoutSessionId: varchar("stripeCheckoutSessionId", { length: 255 })
    .notNull()
    .unique(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  fulfilledAt: timestamp("fulfilledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoursePurchase = typeof coursePurchases.$inferSelect;
export type InsertCoursePurchase = typeof coursePurchases.$inferInsert;

/**
 * Enrollments table - Inscrições de alunos em cursos
 */
export const enrollments = pgTable(
  "enrollments",
  {
    id: serial("id").primaryKey(),
    userId: serial("userId").notNull(),
    courseId: serial("courseId").notNull(),
    progress: integer("progress").default(0).notNull(), // 0-100
    currentModule: integer("currentModule").default(0).notNull(),
    status: enrollmentStatusEnum("status").notNull().default("active"),
    enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
    completedAt: timestamp("completedAt"),
  },
  table => ({
    userCourseIdentity: uniqueIndex("enrollments_user_course_unique_idx").on(
      table.userId,
      table.courseId
    ),
  })
);

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;

/**
 * Materials table - Materiais educacionais (worksheets, slides, etc)
 */
export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(), // Worksheets, Slides, Áudios, etc
  level: varchar("level", { length: 10 }).notNull(), // A1-C2
  fileUrl: varchar("fileUrl", { length: 500 }),
  lessonId: integer("lessonId").references(() => lessons.id),
  downloads: integer("downloads").default(0).notNull(),
  isPublic: boolean("isPublic").default(true).notNull(),
  courseId: integer("courseId").references(() => courses.id),
  instructorId: integer("instructorId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
});

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;

export const materialProgress = pgTable(
  "material_progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    materialId: integer("materialId")
      .notNull()
      .references(() => materials.id, { onDelete: "cascade" }),
    completed: boolean("completed").default(false).notNull(),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  table => ({
    userMaterialIdentity: uniqueIndex("material_progress_user_material_idx").on(
      table.userId,
      table.materialId
    ),
  })
);
export type MaterialProgress = typeof materialProgress.$inferSelect;
export type InsertMaterialProgress = typeof materialProgress.$inferInsert;

export const savedMaterials = pgTable(
  "saved_materials",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    materialId: integer("materialId")
      .notNull()
      .references(() => materials.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    userMaterialIdentity: uniqueIndex("saved_materials_user_material_idx").on(
      table.userId,
      table.materialId
    ),
  })
);
export type SavedMaterial = typeof savedMaterials.$inferSelect;
export type InsertSavedMaterial = typeof savedMaterials.$inferInsert;

/**
 * Articles table - Blog e Knowledge Hub
 */
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content"),
  category: varchar("category", { length: 100 }),
  readingTime: serial("readingTime"), // em minutos
  published: timestamp("published"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

/**
 * Certificates table - Certificados de conclusão
 */
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  courseId: serial("courseId").notNull(),
  level: varchar("level", { length: 10 }).notNull(),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
  certificateUrl: varchar("certificateUrl", { length: 500 }),
  certificateCode: varchar("certificateCode", { length: 64 }),
  signatureType: varchar("signatureType", { length: 16 })
    .notNull()
    .default("none"),
  signedPdfUrl: varchar("signedPdfUrl", { length: 500 }),
  signedAt: timestamp("signedAt"),
  signedBy: integer("signedBy").references(() => users.id),
  /** Template selecionado para a emissão; pode ser interno ou institucional externo. */
  certificateTemplateId: integer("certificateTemplateId"),
  /** Decisão explícita do administrador sobre a logo do site para esta emissão. */
  includeSiteBranding: boolean("includeSiteBranding").notNull().default(true),
});

export const certificateSignatureTypes = ["none", "manual", "govbr"] as const;
export type CertificateSignatureType =
  (typeof certificateSignatureTypes)[number];
export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;

/**
 * Activities table - Atividades e tarefas
 */
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  courseId: serial("courseId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: activityTypeEnum("type").notNull(),
  dueDate: timestamp("dueDate"),
  metadata: jsonb("metadata")
    .$type<{
      tag?: string;
      status?: "pending" | "completed";
      subtasks?: Array<{ id: string; title: string; completed: boolean }>;
      attachments?: Array<{ id: string; name: string; url: string }>;
      order?: number;
    }>()
    .default({}),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

/**
 * User Activity Progress - Progresso do aluno em atividades
 */
export const userActivityProgress = pgTable("userActivityProgress", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  activityId: serial("activityId").notNull(),
  status: progressStatusEnum("status").notNull().default("pending"),
  score: serial("score"),
  audioResponseUrl: varchar("audioResponseUrl", { length: 500 }),
  teacherFeedback: text("teacherFeedback"),
  teacherAudioFeedbackUrl: varchar("teacherAudioFeedbackUrl", { length: 1000 }),
  submittedAt: timestamp("submittedAt"),
  completedAt: timestamp("completedAt"),
});

export type UserActivityProgress = typeof userActivityProgress.$inferSelect;
export type InsertUserActivityProgress =
  typeof userActivityProgress.$inferInsert;

/**
 * Speaking attempts - histórico não destrutivo de gravações e feedbacks
 */
export const speakingAttempts = pgTable(
  "speaking_attempts",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    activityId: integer("activityId").notNull(),
    attemptNumber: integer("attemptNumber").notNull().default(1),
    audioResponseUrl: varchar("audioResponseUrl", { length: 1000 }).notNull(),
    transcript: text("transcript"),
    aiScore: integer("aiScore"),
    aiFeedback: text("aiFeedback"),
    aiSuggestions: text("aiSuggestions"),
    teacherFeedback: text("teacherFeedback"),
    teacherAudioFeedbackUrl: varchar("teacherAudioFeedbackUrl", {
      length: 1000,
    }),
    submittedAt: timestamp("submittedAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    speakingAttemptIdentity: uniqueIndex("speaking_attempt_identity_idx").on(
      table.userId,
      table.activityId,
      table.attemptNumber
    ),
  })
);

export type SpeakingAttempt = typeof speakingAttempts.$inferSelect;
export type InsertSpeakingAttempt = typeof speakingAttempts.$inferInsert;

/**
 * Modules table - Módulos de um curso
 */
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  courseId: serial("courseId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Module = typeof modules.$inferSelect;
export type InsertModule = typeof modules.$inferInsert;

/**
 * Lessons table - Aulas dentro de um módulo
 */
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  moduleId: serial("moduleId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  videoUrl: varchar("videoUrl", { length: 500 }),
  audioUrl: varchar("audioUrl", { length: 1000 }),
  duration: integer("duration"), // em minutos
  order: integer("order").notNull(),
  content: text("content"), // conteúdo em markdown
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

/**
 * Lesson Progress - Progresso do aluno em aulas
 */
export const lessonProgress = pgTable(
  "lessonProgress",
  {
    id: serial("id").primaryKey(),
    userId: serial("userId").notNull(),
    lessonId: serial("lessonId").notNull(),
    completed: integer("completed").default(0), // 0 ou 1
    watchedDuration: integer("watchedDuration").default(0), // em segundos
    completedAt: timestamp("completedAt"),
    approvalStatus: lessonProgressApprovalStatusEnum("approvalStatus")
      .notNull()
      .default("pending"),
    approvedBy: integer("approvedBy").references(() => users.id),
    approvedAt: timestamp("approvedAt"),
    approvalNote: text("approvalNote"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  table => ({
    userLessonIdentity: uniqueIndex("lesson_progress_user_lesson_idx").on(
      table.userId,
      table.lessonId
    ),
  })
);

export type LessonProgress = typeof lessonProgress.$inferSelect;
export type InsertLessonProgress = typeof lessonProgress.$inferInsert;

/**
 * Progress table - Rastreamento de progresso do aluno em cursos
 */
export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id),
  courseId: integer("courseId")
    .notNull()
    .references(() => courses.id),
  enrollmentId: integer("enrollmentId").references(() => enrollments.id),
  lessonsCompleted: integer("lessonsCompleted").default(0),
  totalLessons: integer("totalLessons").default(0),
  percentageCompleted: integer("percentageCompleted").default(0),
  status: progressStatusEnum("status").default("pending"),
  startedAt: timestamp("startedAt").defaultNow(),
  completedAt: timestamp("completedAt"),
  lastAccessedAt: timestamp("lastAccessedAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Progress = typeof progress.$inferSelect;
export type InsertProgress = typeof progress.$inferInsert;

/**
 * Admin Audit Logs table - Histórico de atividades administrativas do super-admin
 */
export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: serial("id").primaryKey(),
  adminEmail: varchar("adminEmail", { length: 320 }).notNull(),
  action: varchar("action", { length: 64 }).notNull(), // approve, reject, role_change, soft_delete, restore, create
  targetName: text("targetName"),
  targetEmail: varchar("targetEmail", { length: 320 }),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;
export type InsertAdminAuditLog = typeof adminAuditLogs.$inferInsert;

/**
 * Contact Messages table - mensagens enviadas pelo formulário público de contato.
 */
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 160 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("readAt"),
  deletedAt: timestamp("deletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactMessageRecord = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

/**
 * Direct Messages table - mensagens diretas entre alunos e professores.
 */
export const directMessages = pgTable("direct_messages", {
  id: serial("id").primaryKey(),
  senderId: integer("senderId")
    .notNull()
    .references(() => users.id),
  receiverId: integer("receiverId")
    .notNull()
    .references(() => users.id),
  subject: varchar("subject", { length: 200 }).notNull(),
  body: text("body").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DirectMessageRecord = typeof directMessages.$inferSelect;
export type InsertDirectMessage = typeof directMessages.$inferInsert;

// Novos Enums para Multimídia, Modalidade e Trilha de Eventos
export const modalityEnum = pgEnum("modality", [
  "individual",
  "group",
  "hybrid",
]);
export const sessionStatusEnum = pgEnum("session_status", [
  "scheduled",
  "completed",
  "cancelled",
]);
export const eventTypeEnum = pgEnum("event_type", [
  "login",
  "material_submission",
  "activity_complete",
  "course_enroll",
  "role_change",
]);
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "justified",
]);

/**
 * Class Sessions table - Aulas/Sessões (individuais ou em grupo) para controle de chamada
 */
export const classSessions = pgTable("class_sessions", {
  id: serial("id").primaryKey(),
  courseId: integer("courseId").references(() => courses.id),
  teacherId: integer("teacherId")
    .notNull()
    .references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  modality: modalityEnum("modality").notNull().default("individual"),
  scheduledAt: timestamp("scheduledAt").notNull(),
  durationMinutes: integer("durationMinutes").default(60),
  status: sessionStatusEnum("status").notNull().default("scheduled"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ClassSession = typeof classSessions.$inferSelect;
export type InsertClassSession = typeof classSessions.$inferInsert;

/**
 * Attendances table - Chamada e presença dos alunos nas sessões
 */
export const attendances = pgTable("attendances", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId")
    .notNull()
    .references(() => classSessions.id, { onDelete: "cascade" }),
  studentId: integer("studentId")
    .notNull()
    .references(() => users.id),
  present: boolean("present").default(true).notNull(),
  status: attendanceStatusEnum("status").notNull().default("present"),
  notes: text("notes"),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

export type Attendance = typeof attendances.$inferSelect;
export type InsertAttendance = typeof attendances.$inferInsert;

/**
 * Event Logs table - Trilha de auditoria para logins, submissões e atividades
 */
export const eventLogs = pgTable("event_logs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id),
  userEmail: varchar("userEmail", { length: 320 }),
  eventType: eventTypeEnum("eventType").notNull(),
  details: text("details"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventLog = typeof eventLogs.$inferSelect;
export type InsertEventLog = typeof eventLogs.$inferInsert;

/**
 * Article Comments & Ratings table - Comentários e avaliações por estrelas em artigos do blog.
 */
export const articleComments = pgTable("article_comments", {
  id: serial("id").primaryKey(),
  articleId: integer("articleId")
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  userName: varchar("userName", { length: 160 }).notNull(),
  userEmail: varchar("userEmail", { length: 320 }),
  rating: integer("rating").notNull().default(5), // 1 a 5 estrelas
  comment: text("comment").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ArticleComment = typeof articleComments.$inferSelect;
export type InsertArticleComment = typeof articleComments.$inferInsert;

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 64 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  message: text("message").notNull(),
  metadata: text("metadata"),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export const courseReviewReplies = pgTable("course_review_replies", {
  id: serial("id").primaryKey(),
  reviewId: integer("reviewId")
    .notNull()
    .references(() => courseReviews.id, { onDelete: "cascade" }),
  authorId: integer("authorId")
    .notNull()
    .references(() => users.id),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CourseReviewReply = typeof courseReviewReplies.$inferSelect;
export type InsertCourseReviewReply = typeof courseReviewReplies.$inferInsert;

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId")
      .notNull()
      .references(() => users.id),
    courseId: integer("courseId")
      .notNull()
      .references(() => courses.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    userCourseIdentity: uniqueIndex("wishlist_user_course_idx").on(
      table.userId,
      table.courseId
    ),
  })
);
export type WishlistItem = typeof wishlistItems.$inferSelect;

export const lessonNotes = pgTable(
  "lesson_notes",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId")
      .notNull()
      .references(() => users.id),
    lessonId: integer("lessonId")
      .notNull()
      .references(() => lessons.id),
    note: text("note").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  table => ({
    userLessonIdentity: uniqueIndex("lesson_notes_user_lesson_idx").on(
      table.userId,
      table.lessonId
    ),
  })
);
export type LessonNote = typeof lessonNotes.$inferSelect;

export const courseReviews = pgTable(
  "course_reviews",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId")
      .notNull()
      .references(() => users.id),
    courseId: integer("courseId")
      .notNull()
      .references(() => courses.id),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  table => ({
    userCourseIdentity: uniqueIndex("course_reviews_user_course_idx").on(
      table.userId,
      table.courseId
    ),
  })
);
export type CourseReview = typeof courseReviews.$inferSelect;

/**
 * Site Content Blocks (CMS) table - Permite editar textos e informações de qualquer página do site.
 */
export const siteContentBlocks = pgTable("site_content_blocks", {
  id: serial("id").primaryKey(),
  pageKey: varchar("pageKey", { length: 100 }).notNull(), // home, sobre, contato, faq, etc.
  sectionKey: varchar("sectionKey", { length: 100 }).notNull(), // hero_title, about_text, banner, etc.
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  status: varchar("status", { length: 32 }).default("published").notNull(), // published, draft, scheduled
  contentType: varchar("contentType", { length: 32 }).default("text").notNull(), // text, markdown, cta, html
  orderIndex: integer("orderIndex").default(0).notNull(),
  tag: varchar("tag", { length: 64 }).default("Geral").notNull(),
  scheduledPublishAt: timestamp("scheduledPublishAt"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SiteContentBlock = typeof siteContentBlocks.$inferSelect;
export type InsertSiteContentBlock = typeof siteContentBlocks.$inferInsert;

/**
 * Site Content Revisions (CMS) table - Armazena histórico de revisões de blocos do CMS para restauração.
 */
export const siteContentRevisions = pgTable("site_content_revisions", {
  id: serial("id").primaryKey(),
  blockId: integer("blockId")
    .notNull()
    .references(() => siteContentBlocks.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  status: varchar("status", { length: 32 }).default("published").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SiteContentRevision = typeof siteContentRevisions.$inferSelect;
export type InsertSiteContentRevision =
  typeof siteContentRevisions.$inferInsert;

/**
 * Gamification User Points & Leaderboard table
 */
export const userGamificationPoints = pgTable(
  "user_gamification_points",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    points: integer("points").default(0).notNull(),
    level: varchar("level", { length: 50 }).default("Explorer (A1)").notNull(),
    streakDays: integer("streakDays").default(0).notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  table => ({
    userGamificationUnique: uniqueIndex("user_gamification_user_idx").on(
      table.userId
    ),
  })
);
export type UserGamificationPoint = typeof userGamificationPoints.$inferSelect;

// A tabela `notifications` acima é a fonte única de verdade para alertas da plataforma.
// A antiga `user_notifications` foi mantida apenas no banco legado por compatibilidade
// até que sua remoção física seja aprovada e executada em uma migração separada.

/**
 * Speaking AI Assistant practice history table
 */
export const speakingAssistantHistory = pgTable("speaking_assistant_history", {
  id: serial("id").primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  promptText: text("promptText").notNull(),
  audioUrl: text("audioUrl"),
  aiFeedback: text("aiFeedback").notNull(),
  score: integer("score").default(85).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SpeakingAssistantHistory =
  typeof speakingAssistantHistory.$inferSelect;

/**
 * Medal/Achievement Catalog table
 */
export const medalsCatalog = pgTable("medals_catalog", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 120 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 32 }).notNull(), // emoji or icon name
  category: varchar("category", { length: 50 })
    .default("achievement")
    .notNull(), // standard, manual, streak, academic
  requirement: text("requirement").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MedalCatalog = typeof medalsCatalog.$inferSelect;
export type InsertMedalCatalog = typeof medalsCatalog.$inferInsert;

/**
 * User Earned Medals table (supporting both automatic unlocks and manual grants)
 */
export const userMedals = pgTable("user_medals", {
  id: serial("id").primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  medalCode: varchar("medalCode", { length: 64 }).notNull(),
  awardedBy: integer("awardedBy").references(() => users.id), // null if automatic, admin userId if manual
  grantType: varchar("grantType", { length: 32 })
    .default("automatic")
    .notNull(), // automatic, manual
  notes: text("notes"), // optional justification when awarded manually
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserMedal = typeof userMedals.$inferSelect;
export type InsertUserMedal = typeof userMedals.$inferInsert;

/**
 * External Classes & Students (SIMAL, Megaworks, UFBA, etc.)
 */
export const externalClasses = pgTable("external_classes", {
  id: serial("id").primaryKey(),
  institution: varchar("institution", { length: 120 }).notNull(), // ex: "SIMAL", "Megaworks", "UFBA"
  className: varchar("className", { length: 180 }).notNull(),
  courseName: varchar("courseName", { length: 180 }).notNull(),
  academicTerm: varchar("academicTerm", { length: 50 }).notNull(), // ex: "2026.1"
  teacherId: integer("teacherId")
    .notNull()
    .references(() => users.id),
  description: text("description"),
  classDays: varchar("class_days", { length: 255 }),
  classTime: varchar("class_time", { length: 100 }),
  workloadHours: integer("workload_hours").default(40),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  maxAbsencePercent: integer("max_absence_percent").default(25),
  modality: varchar("modality", { length: 32 }).default("Remota"),
  meetingLink: varchar("meeting_link", { length: 500 }),
  classroomLocation: varchar("classroom_location", { length: 255 }),
  level: varchar("level", { length: 50 }).default("Básico (A1-A2)"),
  instructorName: varchar("instructor_name", { length: 180 }),
  monitors: varchar("monitors", { length: 500 }),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ExternalClass = typeof externalClasses.$inferSelect;
export type InsertExternalClass = typeof externalClasses.$inferInsert;

export const externalStudents = pgTable("external_students", {
  id: serial("id").primaryKey(),
  externalClassId: integer("externalClassId")
    .notNull()
    .references(() => externalClasses.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 180 }).notNull(),
  socialName: varchar("socialName", { length: 160 }),
  cpf: varchar("cpf", { length: 20 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }), // celular
  studentIdNumber: varchar("studentIdNumber", { length: 64 }), // ex: Matrícula institucional
  category: varchar("category", { length: 100 }), // ex: Estudante de pós-graduação
  university: varchar("university", { length: 120 }), // ex: UFBA
  component: varchar("component", { length: 100 }), // ex: Básico
  status: varchar("status", { length: 32 }).notNull().default("active"), // active, inactive, completed
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ExternalStudent = typeof externalStudents.$inferSelect;
export type InsertExternalStudent = typeof externalStudents.$inferInsert;

/**
 * Media Assets table - Biblioteca de Mídia para persistência real de arquivos no S3 e banco.
 */
export const mediaAssets = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 64 }).notNull(), // medal, audio, image, document
  url: text("url").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  size: varchar("size", { length: 64 }).notNull(),
  tag: varchar("tag", { length: 64 }).default("Geral").notNull(),
  uploaderId: integer("uploaderId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MediaAssetRecord = typeof mediaAssets.$inferSelect;
export type InsertMediaAsset = typeof mediaAssets.$inferInsert;

/**
 * External Classes Attendance, Grades & Materials
 */
export const externalClassAttendance = pgTable("external_class_attendance", {
  id: serial("id").primaryKey(),
  externalClassId: integer("externalClassId")
    .notNull()
    .references(() => externalClasses.id, { onDelete: "cascade" }),
  date: varchar("date", { length: 32 }).notNull(), // ex: "2026-08-17"
  attendanceData: text("attendanceData").notNull(), // JSON string map of studentId -> status ("present", "absent", "late")
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const externalClassGrades = pgTable("external_class_grades", {
  id: serial("id").primaryKey(),
  externalClassId: integer("externalClassId")
    .notNull()
    .references(() => externalClasses.id, { onDelete: "cascade" }),
  studentId: integer("studentId")
    .notNull()
    .references(() => externalStudents.id, { onDelete: "cascade" }),
  assessmentTitle: varchar("assessmentTitle", { length: 180 }).notNull(), // ex: "Avaliação 1", "Quiz Oral"
  score: varchar("score", { length: 32 }).notNull(), // ex: "9.5"
  maxScore: varchar("maxScore", { length: 32 }).notNull().default("10.0"),
  feedback: text("feedback"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const externalClassMaterials = pgTable("external_class_materials", {
  id: serial("id").primaryKey(),
  externalClassId: integer("externalClassId")
    .notNull()
    .references(() => externalClasses.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 180 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const materialComments = pgTable("material_comments", {
  id: serial("id").primaryKey(),
  materialId: integer("material_id")
    .notNull()
    .references(() => materials.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MaterialComment = typeof materialComments.$inferSelect;
export type InsertMaterialComment = typeof materialComments.$inferInsert;

export const gradeReviewRequests = pgTable("grade_review_requests", {
  id: serial("id").primaryKey(),
  gradeId: integer("gradeId")
    .notNull()
    .references(() => externalClassGrades.id, { onDelete: "cascade" }),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("pending"), // pending, reviewed, accepted, rejected
  professorResponse: text("professorResponse"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type GradeReviewRequest = typeof gradeReviewRequests.$inferSelect;
export type InsertGradeReviewRequest = typeof gradeReviewRequests.$inferInsert;

/**
 * Fórum acadêmico: tópicos, respostas e curtidas persistidos no banco.
 * Nenhum conteúdo de demonstração deve ser inserido automaticamente.
 */
export const forumPostStatusEnum = pgEnum("forum_post_status", [
  "pending",
  "approved",
  "rejected",
  "resolved",
]);

export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  authorId: integer("authorId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  content: text("content").notNull(),
  audioUrl: varchar("audioUrl", { length: 1000 }),
  status: forumPostStatusEnum("status").notNull().default("pending"),
  moderationNote: text("moderationNote"),
  moderatedBy: integer("moderatedBy").references(() => users.id),
  moderatedAt: timestamp("moderatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = typeof forumPosts.$inferInsert;

export const forumReplies = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  postId: integer("postId")
    .notNull()
    .references(() => forumPosts.id, { onDelete: "cascade" }),
  authorId: integer("authorId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  audioUrl: varchar("audioUrl", { length: 1000 }),
  isResolved: boolean("isResolved").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = typeof forumReplies.$inferInsert;

export const forumPostLikes = pgTable(
  "forum_post_likes",
  {
    id: serial("id").primaryKey(),
    postId: integer("postId")
      .notNull()
      .references(() => forumPosts.id, { onDelete: "cascade" }),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    postUserIdentity: uniqueIndex("forum_post_likes_post_user_idx").on(
      table.postId,
      table.userId
    ),
  })
);
export type ForumPostLike = typeof forumPostLikes.$inferSelect;
export type InsertForumPostLike = typeof forumPostLikes.$inferInsert;

/**
 * Teacher ZIP Exports table - Histórico de exportações de materiais em ZIP pelo professor
 */
export const teacherZipExports = pgTable("teacher_zip_exports", {
  id: serial("id").primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  filename: varchar("filename", { length: 255 }).notNull(),
  materialCount: integer("materialCount").notNull(),
  totalBytes: integer("totalBytes").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type TeacherZipExport = typeof teacherZipExports.$inferSelect;
export type InsertTeacherZipExport = typeof teacherZipExports.$inferInsert;

/**
 * Cupons de desconto administrados pelo painel e sincronizados com Stripe.
 * O código local mantém a auditoria e o estado de ativação; o desconto é validado pelo Stripe no checkout.
 */
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  stripeCouponId: varchar("stripeCouponId", { length: 255 }).notNull().unique(),
  percentOff: varchar("percentOff", { length: 32 }),
  amountOff: varchar("amountOff", { length: 32 }),
  currency: varchar("currency", { length: 3 }).notNull().default("brl"),
  maxRedemptions: integer("maxRedemptions"),
  redeemBy: timestamp("redeemBy"),
  active: boolean("active").notNull().default(true),
  createdBy: integer("createdBy")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

/**
 * Concessões manuais de acesso a conteúdos pagos (cursos/materiais) pelo Super Administrador.
 * Garante que o administrador (palafozanderson@gmail.com) possa liberar acesso pago a qualquer conta.
 */
export const manualAccessGrants = pgTable(
  "manual_access_grants",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: integer("courseId").references(() => courses.id, {
      onDelete: "cascade",
    }),
    materialId: integer("materialId").references(() => materials.id, {
      onDelete: "cascade",
    }),
    grantedBy: integer("grantedBy")
      .notNull()
      .references(() => users.id),
    reason: text("reason").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    userCourseUnique: uniqueIndex("manual_access_user_course_idx").on(
      table.userId,
      table.courseId
    ),
    userMaterialUnique: uniqueIndex("manual_access_user_material_idx").on(
      table.userId,
      table.materialId
    ),
  })
);

export type ManualAccessGrant = typeof manualAccessGrants.$inferSelect;
export type InsertManualAccessGrant = typeof manualAccessGrants.$inferInsert;

/**
 * Admin Activity Logs - Rastreamento de ações administrativas (exclusões, restaurações, lote)
 */
export const adminActivityLogs = pgTable("admin_activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  userEmail: varchar("userEmail", { length: 320 }),
  userName: varchar("userName", { length: 255 }),
  action: varchar("action", { length: 64 }).notNull(), // 'soft_delete', 'restore', 'permanent_delete', 'batch_restore', 'batch_permanent_delete'
  targetType: varchar("targetType", { length: 64 }).notNull().default("course"), // 'course'
  targetIds: text("targetIds").notNull(), // IDs dos cursos afetados separados por vírgula ou JSON
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminActivityLog = typeof adminActivityLogs.$inferSelect;
export type InsertAdminActivityLog = typeof adminActivityLogs.$inferInsert;

/**
 * Certificate Templates table - Modelos de certificados próprios e de terceiros (IsF, PROFICI, SIMAL, etc.)
 */
export const certificateTemplates = pgTable("certificate_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 180 }).notNull(), // ex: "Modelo Oficial Plataforma", "Modelo IsF 2026", "Modelo PROFICI", "Modelo SIMAL"
  category: varchar("category", { length: 50 }).notNull().default("internal"), // "internal" ou "external"
  institution: varchar("institution", { length: 120 }), // ex: "UFBA / IsF", "PROFICI", "SIMAL", "Geral"
  isDefault: boolean("isDefault").notNull().default(false),
  templateUrl: text("templateUrl"), // URL do PDF base ou imagem de fundo do template enviado
  includeSiteBranding: boolean("includeSiteBranding").notNull().default(true), // escolha administrativa: incluir ou não a logo do site
  fieldMappings: text("fieldMappings"), // JSON configurando coordenadas/campos preenchíveis (nome, cpf, curso, carga horária, data, etc.)
  createdBy: integer("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CertificateTemplate = typeof certificateTemplates.$inferSelect;
export type InsertCertificateTemplate =
  typeof certificateTemplates.$inferInsert;

export const articleCommentReplies = pgTable("article_comment_replies", {
  id: serial("id").primaryKey(),
  commentId: integer("commentId")
    .notNull()
    .references(() => articleComments.id, { onDelete: "cascade" }),
  authorId: integer("authorId")
    .notNull()
    .references(() => users.id),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ArticleCommentReply = typeof articleCommentReplies.$inferSelect;
export type InsertArticleCommentReply = typeof articleCommentReplies.$inferInsert;
