import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { InsertUser, users, courses, materials, articles, enrollments, certificates, activities } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.SUPABASE_URL) {
    try {
      // Construct PostgreSQL connection string from Supabase
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      // Extract host from Supabase URL
      const url = new URL(supabaseUrl);
      const host = url.hostname;
      
      // Construct connection string for Supabase PostgreSQL
      const connectionString = `postgresql://postgres:${supabaseKey}@${host}:5432/postgres?sslmode=require`;
      
      const client = postgres(connectionString);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    // Upsert user
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: {
        name: values.name,
        email: values.email,
        loginMethod: values.loginMethod,
        lastSignedIn: values.lastSignedIn,
        role: values.role,
      },
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Courses queries
export async function getCourses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses);
}

export async function getCoursesByLevel(level: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses).where(eq(courses.level, level));
}

// Materials queries
export async function getMaterials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(materials);
}

export async function getMaterialsByLevel(level: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(materials).where(eq(materials.level, level));
}

// Articles queries
export async function getArticles() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(articles);
}

export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Enrollments queries
export async function getUserEnrollments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(enrollments).where(eq(enrollments.userId, userId));
}

export async function enrollUserInCourse(userId: number, courseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(enrollments).values({ userId, courseId, status: "active" });
}

// Certificates queries
export async function getUserCertificates(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(certificates).where(eq(certificates.userId, userId));
}

// Activities queries
export async function getCourseActivities(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activities).where(eq(activities.courseId, courseId));
}
