import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";

export async function getTeacherSession() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();
  if (!session?.user || !email) return { session, canAccess: false };

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  const canAccess = Boolean(
    user &&
    !user.deletedAt &&
    user.approvalStatus === "approved" &&
    (user.role === "professor" || user.role === "admin"),
  );

  return {
    session: canAccess && user ? { ...session, user: { ...session.user, id: user.id, role: user.role, approvalStatus: user.approvalStatus, deletedAt: null } } : session,
    canAccess,
  };
}

export function isTeacherOrAdminRole(role: string | undefined) {
  return role === "professor" || role === "admin";
}
