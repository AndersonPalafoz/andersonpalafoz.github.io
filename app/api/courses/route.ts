import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { courses } from "@/drizzle/schema";
import { isLearnerVisibleCourse } from "@/lib/course-visibility";

export async function GET() {
  try {
    const courseList = await db.select().from(courses).limit(100);
    return NextResponse.json(courseList.filter(isLearnerVisibleCourse));
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
