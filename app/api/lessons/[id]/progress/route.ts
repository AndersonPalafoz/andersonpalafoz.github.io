import { NextResponse } from "next/server";
import { updateLessonProgress } from "@/lib/db";
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
    const lessonId = parseInt(id);
    const body = await request.json();
    const { completed } = body;

    // Get userId from session
    // Note: In a real app, userId would be stored in the session
    // For now, we use a placeholder. This should be updated when user table is linked to auth.
    const userId = parseInt(session.user.email?.split('@')[0] || '1');

    // Ensure userId is valid
    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const result = await updateLessonProgress(userId, lessonId, completed ? 1 : 0);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error updating lesson progress:", error);
    return NextResponse.json(
      { error: "Failed to update lesson progress" },
      { status: 500 }
    );
  }
}
