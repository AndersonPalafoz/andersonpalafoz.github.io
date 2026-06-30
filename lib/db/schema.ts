import { pgTable, text, timestamp, boolean, serial, integer } from "drizzle-orm/pg-core"

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// --- App tables ------------------------------------------------------------
// Plataforma educacional Anderson Palafoz.

/** Cursos disponíveis na plataforma */
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  level: text("level").notNull(), // A1, A2, B1, B2, C1, C2
  modules: integer("modules").default(0),
  instructor: text("instructor").default("Anderson Palafoz"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

/** Materiais educacionais (worksheets, slides, etc) */
export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // Worksheets, Slides, Áudios, etc
  level: text("level").notNull(), // A1-C2
  fileUrl: text("fileUrl"),
  downloads: integer("downloads").default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

/** Blog e Knowledge Hub */
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content"),
  category: text("category"),
  readingTime: integer("readingTime"), // em minutos
  published: timestamp("published"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

/** Inscrições de alunos em cursos */
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  courseId: integer("courseId").notNull(),
  progress: integer("progress").default(0), // 0-100
  currentModule: integer("currentModule").default(0),
  status: text("status").default("active"), // active, completed, paused
  enrolledAt: timestamp("enrolledAt").notNull().defaultNow(),
  completedAt: timestamp("completedAt"),
})

/** Certificados de conclusão */
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  courseId: integer("courseId").notNull(),
  level: text("level").notNull(),
  issuedAt: timestamp("issuedAt").notNull().defaultNow(),
  certificateUrl: text("certificateUrl"),
})

/** Atividades e tarefas */
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  courseId: integer("courseId").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // quiz, exercise, assignment, speaking
  dueDate: timestamp("dueDate"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

/** Progresso do aluno em atividades */
export const userActivityProgress = pgTable("userActivityProgress", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  activityId: integer("activityId").notNull(),
  status: text("status").default("pending"), // pending, in_progress, completed
  score: integer("score"),
  submittedAt: timestamp("submittedAt"),
  completedAt: timestamp("completedAt"),
})

export type Course = typeof courses.$inferSelect
export type Material = typeof materials.$inferSelect
export type Article = typeof articles.$inferSelect
export type Enrollment = typeof enrollments.$inferSelect
export type Certificate = typeof certificates.$inferSelect
export type Activity = typeof activities.$inferSelect
