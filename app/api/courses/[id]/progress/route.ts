import { NextResponse } from "next/server";
import { updateCourseProgress } from "@/lib/db";
import { getServerSession } from "next-auth/next";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify user is authenticated
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const courseId = parseInt(id);
    const body = await request.json();
    const { lessonsCompleted, totalLessons } = body;

    // Get userId from session
    // Note: session.user needs to have an id field from your auth provider
    const userId = parseInt(session.user.id || '1');
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      );
    }

    const result = await updateCourseProgress(
      userId,
      courseId,
      lessonsCompleted,
      totalLessons
    );
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error updating course progress:", error);
    return NextResponse.json(
      { error: "Failed to update course progress" },
      { status: 500 }
    );
  }
}
