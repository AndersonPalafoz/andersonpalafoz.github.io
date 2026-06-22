import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Courses table - Cursos disponíveis na plataforma
 */
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  level: varchar("level", { length: 10 }).notNull(), // A1, A2, B1, B2, C1, C2
  modules: int("modules").default(0),
  instructor: varchar("instructor", { length: 255 }).default("Anderson Palafoz"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

/**
 * Enrollments table - Inscrições de alunos em cursos
 */
export const enrollments = mysqlTable("enrollments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId").notNull(),
  progress: int("progress").default(0), // 0-100
  currentModule: int("currentModule").default(0),
  status: mysqlEnum("status", ["active", "completed", "paused"]).default("active"),
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;

/**
 * Materials table - Materiais educacionais (worksheets, slides, etc)
 */
export const materials = mysqlTable("materials", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(), // Worksheets, Slides, Áudios, etc
  level: varchar("level", { length: 10 }).notNull(), // A1-C2
  fileUrl: varchar("fileUrl", { length: 500 }),
  downloads: int("downloads").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;

/**
 * Articles table - Blog e Knowledge Hub
 */
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content"),
  category: varchar("category", { length: 100 }),
  readingTime: int("readingTime"), // em minutos
  published: timestamp("published"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

/**
 * Certificates table - Certificados de conclusão
 */
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId").notNull(),
  level: varchar("level", { length: 10 }).notNull(),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
  certificateUrl: varchar("certificateUrl", { length: 500 }),
});

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;

/**
 * Activities table - Atividades e tarefas
 */
export const activities = mysqlTable("activities", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["quiz", "exercise", "assignment", "speaking"]).notNull(),
  dueDate: timestamp("dueDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

/**
 * User Activity Progress - Progresso do aluno em atividades
 */
export const userActivityProgress = mysqlTable("userActivityProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  activityId: int("activityId").notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed"]).default("pending"),
  score: int("score"),
  submittedAt: timestamp("submittedAt"),
  completedAt: timestamp("completedAt"),
});

export type UserActivityProgress = typeof userActivityProgress.$inferSelect;
export type InsertUserActivityProgress = typeof userActivityProgress.$inferInsert;
