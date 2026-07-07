import { NextResponse } from "next/server";
import { getModulesByCourse } from "@/lib/db";

export async function GET(
  _request: unknown,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const courseId = parseInt(id);
    const modules = await getModulesByCourse(courseId);
    return NextResponse.json(modules);
  } catch (error) {
    console.error("Error fetching modules:", error);
    return NextResponse.json(
      { error: "Failed to fetch modules" },
      { status: 500 }
    );
  }
}
