import type { Account } from "next-auth";
import { db } from "@/lib/db";
import { googleClassroomConnections } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import {
  encryptClassroomToken,
  GOOGLE_CLASSROOM_READONLY_SCOPES,
  getClassroomAuthorizedRole,
  hasClassroomReadonlyScope,
  type ClassroomAuthorizedRole,
} from "@/lib/google-classroom-crypto";

export {
  GOOGLE_CLASSROOM_READONLY_SCOPES,
  GOOGLE_CLASSROOM_TEACHER_SCOPES,
  GOOGLE_CLASSROOM_STUDENT_SCOPES,
  getClassroomAuthorizedRole,
  hasClassroomReadonlyScope,
} from "@/lib/google-classroom-crypto";

export async function persistClassroomConnection({
  userId,
  googleAccountId,
  googleEmail,
  account,
  authorizedRole = "teacher",
}: {
  userId: number;
  googleAccountId: string;
  googleEmail: string;
  account: Account;
  authorizedRole?: "teacher" | "student" | "admin";
}) {
  if (!account.access_token || !hasClassroomReadonlyScope(account.scope)) return false;
  const grantedRole = getClassroomAuthorizedRole(account.scope);
  if (!grantedRole) return false;
  const persistedRole: ClassroomAuthorizedRole = authorizedRole === "admin" ? "admin" : grantedRole;

  const existing = await db.query.googleClassroomConnections.findFirst({
    where: eq(googleClassroomConnections.userId, userId),
  });

  const values = {
    userId,
    googleAccountId,
    googleEmail,
    accessTokenEncrypted: encryptClassroomToken(account.access_token),
    refreshTokenEncrypted: account.refresh_token
      ? encryptClassroomToken(account.refresh_token)
      : existing?.refreshTokenEncrypted ?? null,
    tokenExpiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
    scopes: account.scope || "",
    authorizedRole: persistedRole,
    status: "active",
    lastError: null,
    consentedAt: new Date(),
    revokedAt: null,
    updatedAt: new Date(),
  };

  if (existing) {
    await db
      .update(googleClassroomConnections)
      .set(values)
      .where(eq(googleClassroomConnections.id, existing.id));
  } else {
    await db.insert(googleClassroomConnections).values({
      ...values,
      createdAt: new Date(),
    });
  }

  return true;
}
