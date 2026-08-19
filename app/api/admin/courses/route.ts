import { NextRequest, NextResponse } from "next/server";
import { getCourses, getTrashCourses, createCourse, updateCourse, softDeleteCourse, restoreCourse, deleteCourse } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");

    if (mode === "trash") {
      const trash = await getTrashCourses();
      return NextResponse.json(trash);
    }

    const courses = await getCourses();
    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const course = await createCourse(data);
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, ...data } = await request.json();
    const course = await updateCourse(id, data);
    return NextResponse.json(course);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const permanent = searchParams.get("permanent") === "true";
    const restore = searchParams.get("restore") === "true";

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const courseId = parseInt(id);

    if (restore) {
      const restored = await restoreCourse(courseId);
      return NextResponse.json(restored);
    }

    if (permanent) {
      const deleted = await deleteCourse(courseId);
      return NextResponse.json(deleted);
    }

    const softDeleted = await softDeleteCourse(courseId);
    return NextResponse.json(softDeleted);
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}
