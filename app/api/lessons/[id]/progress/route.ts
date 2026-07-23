import { NextResponse } from "next/server";
import { updateLessonProgress } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
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

    // Get userId from session (populated by the session callback in lib/auth.ts,
    // which looks up the user row by email and sets session.user.id)
    const userId = parseInt(session.user.id ?? "");

    // Ensure userId is valid
    if (!session.user.id || isNaN(userId) || userId <= 0) {
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
