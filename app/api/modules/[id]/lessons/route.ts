import { NextResponse } from "next/server";
import { getLessonsByModule } from "@/lib/db";

export async function GET(
  _request: unknown,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const moduleId = parseInt(id);
    const lessons = await getLessonsByModule(moduleId);
    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}
