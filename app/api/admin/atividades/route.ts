import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { activities } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";

type TaskMetadata = {
  tag?: string;
  status?: "pending" | "completed";
  subtasks?: Array<{ id: string; title: string; completed: boolean }>;
  attachments?: Array<{ id: string; name: string; url: string }>;
  order?: number;
};

function canManage(role?: string | null) {
  return role === "professor" || role === "admin";
}

function serializeActivity(activity: any) {
  const metadata = (activity.metadata || {}) as TaskMetadata;
  return {
    ...activity,
    tag: metadata.tag || "Gramática",
    status: metadata.status || "pending",
    subtasks: metadata.subtasks || [],
    attachments: metadata.attachments || [],
    order: metadata.order ?? activity.id,
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !canManage(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const allActivities = await db.query.activities.findMany({
      with: { course: true },
      orderBy: [desc(activities.createdAt)],
    });
    return NextResponse.json({ activities: allActivities.map(serializeActivity) });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !canManage(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, description, dueDate, type, tag, status, subtasks, attachments, order } = body;
    const activityId = Number(id);
    if (!Number.isInteger(activityId) || activityId <= 0) {
      return NextResponse.json({ error: "Activity ID is required" }, { status: 400 });
    }

    const existing = await db.query.activities.findFirst({ where: eq(activities.id, activityId) });
    if (!existing) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    const current = (existing.metadata || {}) as TaskMetadata;
    const nextMetadata: TaskMetadata = {
      ...current,
      ...(tag !== undefined ? { tag: String(tag) } : {}),
      ...(status !== undefined ? { status: status === "completed" ? "completed" : "pending" } : {}),
      ...(subtasks !== undefined ? { subtasks } : {}),
      ...(attachments !== undefined ? { attachments } : {}),
      ...(order !== undefined ? { order: Number(order) } : {}),
    };

    const updated = await db.update(activities).set({
      title: title !== undefined ? String(title).trim() : undefined,
      description: description !== undefined ? description : undefined,
      dueDate: dueDate === null || dueDate === "" ? null : dueDate !== undefined ? new Date(dueDate) : undefined,
      type: type || undefined,
      metadata: nextMetadata,
    }).where(eq(activities.id, activityId)).returning();

    return NextResponse.json({ success: true, activity: serializeActivity(updated[0]) });
  } catch (error) {
    console.error("Error updating activity:", error);
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !canManage(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Activity ID is required" }, { status: 400 });
    await db.delete(activities).where(eq(activities.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting activity:", error);
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 });
  }
}
