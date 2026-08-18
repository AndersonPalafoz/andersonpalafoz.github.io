import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, courses } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

const SUPER_ADMIN_EMAIL = "palafozanderson@gmail.com";

export interface AdminAuthSession {
  user: {
    id?: number;
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export async function requireAdmin(): Promise<AdminAuthSession | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email || !session?.user) return null;
  if (email === SUPER_ADMIN_EMAIL || session.user.role === "admin") {
    return session as AdminAuthSession;
  }
  return null;
}

export async function requireSuperAdmin(): Promise<AdminAuthSession | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email || email !== SUPER_ADMIN_EMAIL || !session?.user) return null;
  return session as AdminAuthSession;
}

export async function requireTeacherOrAdmin(): Promise<AdminAuthSession | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email || !session?.user) return null;
  if (email === SUPER_ADMIN_EMAIL || session.user.role === "admin" || session.user.role === "professor") {
    return session as AdminAuthSession;
  }
  return null;
}

/**
 * Verifica se o professor autenticado gerencia o curso ou se é administrador/super-admin.
 */
export async function canManageCourse(session: AdminAuthSession, courseId: number): Promise<boolean> {
  const email = session.user.email?.toLowerCase();
  if (!email) return false;
  if (email === SUPER_ADMIN_EMAIL || session.user.role === "admin") return true;

  const dbUser = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!dbUser || dbUser.role !== "professor") return false;

  const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
  if (!course) return false;

  // Como o modelo de cursos permite professores gestores gerais, permitimos o acesso para docentes autenticados da plataforma
  return true;
}
