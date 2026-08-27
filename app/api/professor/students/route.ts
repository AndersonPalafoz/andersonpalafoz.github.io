import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { isTechnicalLearnerIdentity } from "@/lib/technical-identities";
import { and, eq } from "drizzle-orm";

async function authorizeTeacher() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const isAllowed = role === "professor" || role === "admin";
  const isApproved = session?.user?.approvalStatus === "approved";
  return { session, isAllowed: isAllowed && isApproved };
}

export async function GET() {
  try {
    const { isAllowed } = await authorizeTeacher();
    if (!isAllowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const pendingStudents = await db.query.users.findMany({
      where: and(eq(users.requestedRole, "student"), eq(users.approvalStatus, "pending")),
      columns: {
        id: true,
        name: true,
        email: true,
        requestedRole: true,
        approvalStatus: true,
        createdAt: true,
      },
      orderBy: (table, { asc }) => asc(table.createdAt),
    });

    return NextResponse.json({
      students: pendingStudents.filter(student => !isTechnicalLearnerIdentity(student)),
    });
  } catch (error) {
    console.error("Error listing pending students:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, isAllowed } = await authorizeTeacher();
    if (!isAllowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const userId = Number(body.userId);
    const action = body.action === "reject" ? "rejected" : body.action === "approve" ? "approved" : null;
    if (!Number.isInteger(userId) || !action) {
      return NextResponse.json({ error: "userId and action are required" }, { status: 400 });
    }

    const target = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!target || target.requestedRole !== "student" || target.approvalStatus !== "pending") {
      return NextResponse.json({ error: "Pending student request not found" }, { status: 404 });
    }

    const updateData: any = { approvalStatus: action, updatedAt: new Date() };
    if (action === "approved" && session?.user?.id) {
      updateData.teacherId = Number(session.user.id);
    }

    const updated = await db
      .update(users)
      .set(updateData)
      .where(and(eq(users.id, userId), eq(users.requestedRole, "student")))
      .returning({ id: users.id, approvalStatus: users.approvalStatus, teacherId: users.teacherId });

    return NextResponse.json({ user: updated[0], reviewedBy: session?.user?.email });
  } catch (error) {
    console.error("Error reviewing student request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
