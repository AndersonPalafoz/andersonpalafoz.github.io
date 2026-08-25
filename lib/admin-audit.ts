import { adminAuditLogs } from "@/drizzle/schema";
import { db } from "@/lib/db";

export const ADMIN_AUDIT_ACTIONS = {
  APPROVE: "approve",
  REJECT: "reject",
  ROLE_CHANGE: "role_change",
  SOFT_DELETE: "soft_delete",
  PERMANENT_DELETE: "permanent_delete",
  RESTORE: "restore",
  CREATE: "create",
} as const;

export type AdminAuditAction = (typeof ADMIN_AUDIT_ACTIONS)[keyof typeof ADMIN_AUDIT_ACTIONS];

interface LogAdminActivityInput {
  adminEmail: string;
  action: AdminAuditAction;
  targetName?: string | null;
  targetEmail?: string | null;
  details?: string | null;
}

export async function logAdminActivity(input: LogAdminActivityInput) {
  try {
    await db.insert(adminAuditLogs).values({
      adminEmail: input.adminEmail,
      action: input.action,
      targetName: input.targetName ?? null,
      targetEmail: input.targetEmail ?? null,
      details: input.details ?? null,
    });
  } catch (error) {
    // A falha de auditoria não deve desfazer uma operação administrativa já concluída.
    console.error("Unable to persist admin audit activity:", error);
  }
}
