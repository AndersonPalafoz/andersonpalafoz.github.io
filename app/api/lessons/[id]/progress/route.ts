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
    const userId = 1; // TODO: Extract from session.user

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
