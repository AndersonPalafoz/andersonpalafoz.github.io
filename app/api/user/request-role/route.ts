import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "palafozanderson@gmail.com";
const ALLOWED_REQUESTS = new Set(["student", "professor"]);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.email === ADMIN_EMAIL || session.user.role === "admin") {
      return NextResponse.json({ error: "Administrators do not need to request a role" }, { status: 400 });
    }

    const body = await request.json();
    const requestedRole = typeof body.requestedRole === "string" ? body.requestedRole : "";
    if (!ALLOWED_REQUESTS.has(requestedRole)) {
      return NextResponse.json({ error: "requestedRole must be student or professor" }, { status: 400 });
    }

    const currentUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (currentUser.deletedAt) {
      return NextResponse.json({ error: "Account is blocked" }, { status: 403 });
    }

    const updated = await db
      .update(users)
      .set({
        requestedRole,
        approvalStatus: "pending",
        updatedAt: new Date(),
      })
      .where(eq(users.id, currentUser.id))
      .returning({ id: users.id, requestedRole: users.requestedRole, approvalStatus: users.approvalStatus });

    return NextResponse.json({ user: updated[0] });
  } catch (error) {
    console.error("Error requesting role:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
