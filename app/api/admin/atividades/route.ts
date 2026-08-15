import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { activities } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allActivities = await db.query.activities.findMany({
      with: { course: true },
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });
    return NextResponse.json({ activities: allActivities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "professor" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, description, dueDate, type } = body;
    if (!id) {
      return NextResponse.json({ error: "Activity ID is required" }, { status: 400 });
    }

    const updated = await db
      .update(activities)
      .set({
        title: title ? title.trim() : undefined,
        description: description !== undefined ? description : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        type: type || undefined,
      })
      .where(eq(activities.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, activity: updated[0] });
  } catch (error) {
    console.error("Error updating activity:", error);
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "professor" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Activity ID is required" }, { status: 400 });
    }

    await db.delete(activities).where(eq(activities.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting activity:", error);
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 });
  }
}
