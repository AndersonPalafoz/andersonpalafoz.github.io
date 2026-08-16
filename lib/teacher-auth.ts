import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getTeacherSession() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const isApproved = session?.user?.approvalStatus === "approved";
  const isActive = !session?.user?.deletedAt;
  const canAccess = Boolean(session?.user && (role === "professor" || role === "admin") && isApproved && isActive);

  return { session, canAccess };
}

export function isTeacherOrAdminRole(role: string | undefined) {
  return role === "professor" || role === "admin";
}
