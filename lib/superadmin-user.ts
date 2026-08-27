import { eq } from "drizzle-orm";
import { requireSuperAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";

/** Retorna o usuário persistido somente quando a sessão tem o privilégio global. */
export async function requireSuperAdminUser() {
  const session = await requireSuperAdmin();
  const email = session?.user.email?.toLowerCase();
  if (!email) return null;
  return db.query.users.findFirst({ where: eq(users.email, email) });
}
