import { pgTable, pgEnum, serial, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";

// Enums
// Nota: a migração 0003_skinny_vermin.sql adicionou 'professor' ao enum no banco.
// Nenhuma rota/UI usa esse valor ainda -- apenas alinhando o schema TS à realidade do banco.
export const roleEnum = pgEnum("role", ["user", "professor", "admin"]);
export const approvalStatusEnum = pgEnum("approval_status", ["pending", "approved", "rejected"]);
export const enrollmentStatusEnum = pgEnum("enrollment_status", ["active", "completed", "paused"]);
export const activityTypeEnum = pgEnum("activity_type", ["quiz", "exercise", "assignment", "speaking"]);
export const progressStatusEnum = pgEnum("progress_status", ["pending", "in_progress", "completed"]);

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
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").notNull().default("user"), // user, admin
  approvalStatus: approvalStatusEnum("approvalStatus").notNull().default("pending"), // pending, approved, rejected
  phone: varchar("phone", { length: 32 }),
  location: varchar("location", { length: 120 }),
  bio: text("bio"),
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

/**
 * Courses table - Cursos disponíveis na plataforma
 */
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  level: varchar("level", { length: 10 }).notNull(), // A1, A2, B1, B2, C1, C2
  modules: integer("modules").default(0),
  instructor: varchar("instructor", { length: 255 }).default("Anderson Palafoz"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

/**
 * Enrollments table - Inscrições de alunos em cursos
 */
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  courseId: serial("courseId").notNull(),
  progress: integer("progress").default(0).notNull(), // 0-100
  currentModule: integer("currentModule").default(0).notNull(),
  status: enrollmentStatusEnum("status").notNull().default("active"),
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

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
  downloads: integer("downloads").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;

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
});

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
  submittedAt: timestamp("submittedAt"),
  completedAt: timestamp("completedAt"),
});

export type UserActivityProgress = typeof userActivityProgress.$inferSelect;
export type InsertUserActivityProgress = typeof userActivityProgress.$inferInsert;

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
export const lessonProgress = pgTable("lessonProgress", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  lessonId: serial("lessonId").notNull(),
  completed: integer("completed").default(0), // 0 ou 1
  watchedDuration: integer("watchedDuration").default(0), // em segundos
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type LessonProgress = typeof lessonProgress.$inferSelect;
export type InsertLessonProgress = typeof lessonProgress.$inferInsert;


/**
 * Progress table - Rastreamento de progresso do aluno em cursos
 */
export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  courseId: integer("courseId").notNull().references(() => courses.id),
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
