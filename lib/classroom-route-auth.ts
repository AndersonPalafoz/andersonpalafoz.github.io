import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { cronUserId } from "@/lib/classroom-cron-auth";

export async function getClassroomRouteIdentity(request: Request) {
  const scheduledUserId = cronUserId(request);
  if (scheduledUserId) return { userId: scheduledUserId, role: "cron" as const };

  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);
  if (!session?.user || !Number.isInteger(userId) || userId <= 0) return null;
  return { userId, role: session.user.role || "user" };
}

export function canSyncClassroomRole(role: string, authorizedRole: string, action: "read" | "roster") {
  if (role === "cron" || role === "admin") return true;
  if (action === "roster") return false;
  return authorizedRole === "student" || authorizedRole === "teacher" || authorizedRole === "admin";
}

export function isStudentClassroomConnection(authorizedRole: string) {
  return authorizedRole === "student";
}

export function isTeacherClassroomConnection(authorizedRole: string) {
  return authorizedRole === "teacher" || authorizedRole === "admin";
}

export function unauthorizedClassroomResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
