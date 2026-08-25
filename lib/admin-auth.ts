import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, courses, externalClasses, materials } from "@/drizzle/schema";
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
  const role = session.user.role;
  if (email === SUPER_ADMIN_EMAIL || role === "admin" || role === "super_admin" || role === "professor") {
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
  const role = session.user.role;
  if (email === SUPER_ADMIN_EMAIL || role === "admin" || role === "super_admin" || role === "professor") {
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
  if (email === SUPER_ADMIN_EMAIL || session.user.role === "admin" || session.user.role === "super_admin") return true;

  const dbUser = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!dbUser || dbUser.role !== "professor") return false;

  const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
  if (!course) return false;

  // Se o curso tiver instructorId ou form de autoria, checamos. Caso contrário, se o professor for o criador ou responsável, permitimos.
  // Regra solicitada: professor só pode excluir/lixeira/recuperar itens que ele mesmo criou. 
  // Se course.instructor (ou instructorId) bater com o nome/email do professor, ou se ele for o criador.
  const instructorName = course.instructor?.toLowerCase();
  const matchesName = Boolean(dbUser.name && instructorName === dbUser.name.toLowerCase());
  const matchesEmail = Boolean(dbUser.email && instructorName === dbUser.email.toLowerCase());
  if (instructorName && !matchesName && !matchesEmail) return false;
  return true;
}

export async function canManageExternalClass(session: AdminAuthSession, classId: number): Promise<boolean> {
  const email = session.user.email?.toLowerCase();
  if (!email) return false;
  if (email === SUPER_ADMIN_EMAIL || session.user.role === "admin" || session.user.role === "super_admin") return true;

  const dbUser = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!dbUser || dbUser.role !== "professor") return false;

  const extClass = await db.query.externalClasses.findFirst({ where: eq(externalClasses.id, classId) });
  if (!extClass) return false;

  return extClass.teacherId === dbUser.id;
}


export async function canManageMaterial(session: AdminAuthSession, materialId: number): Promise<boolean> {
  const email = session.user.email?.toLowerCase();
  if (!email) return false;
  if (email === SUPER_ADMIN_EMAIL || session.user.role === "admin" || session.user.role === "super_admin") return true;

  const dbUser = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!dbUser || dbUser.role !== "professor") return false;

  const material = await db.query.materials.findFirst({ where: eq(materials.id, materialId) });
  if (!material) return false;

  if (material.instructorId && material.instructorId !== dbUser.id) {
    return false;
  }
  return true;
}

