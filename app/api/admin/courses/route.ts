import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCourses, getTrashCourses, createCourse, updateCourse, softDeleteCourse, restoreCourse, deleteCourse } from "@/lib/db";
import { requireAdmin, canManageCourse } from "@/lib/admin-auth";
import { validateCourseTypeFields } from "@/lib/course-types";

const coursePayloadSchema = z.object({
  title: z.string().trim().min(1, "O título do curso é obrigatório.").max(255),
  description: z.string().optional().nullable(),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  category: z.string().trim().max(120).optional().nullable(),
  modules: z.number().int().min(0).max(100).optional(),
  instructor: z.string().trim().max(255).optional().nullable(),
  modality: z.string().trim().max(32).optional().nullable(),
  isFree: z.boolean().optional(),
  price: z.number().min(0).max(99999999).optional(),
  imageUrl: z.string().trim().max(1000).optional().nullable(),
  audioUrl: z.string().trim().max(1000).optional().nullable(),
  videoUrl: z.string().trim().max(1000).optional().nullable(),
  googleDriveLinks: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  classDays: z.string().trim().max(255).optional().nullable(),
  classTime: z.string().trim().max(100).optional().nullable(),
  workloadHours: z.number().int().min(0).max(5000).optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  durationType: z.enum(["annual", "semester", "workload", "custom"]).optional(),
  durationValue: z.number().int().positive().max(9999).optional().nullable(),
  durationUnit: z.string().trim().max(24).optional().nullable(),
  maxAbsencePercent: z.number().int().min(0).max(100).optional(),
  hasUnits: z.boolean().optional(),
  unitCount: z.number().int().min(1).max(100).optional().nullable(),
  gradingScope: z.enum(["course", "unit"]).optional(),
  passingAverage: z.number().min(0).max(10).optional(),
  unitPassingAverages: z.string().max(5000).optional().nullable(),
  courseType: z.number().int().min(1).max(5).optional(),
  externalRedirectUrl: z.string().trim().max(1000).optional().nullable(),
  syncModality: z.enum(["none", "online_individual", "online_group", "presencial"]).optional(),
});

const createCourseSchema = coursePayloadSchema.extend({
  title: z.string().trim().min(1, "O título do curso é obrigatório.").max(255),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
});

function parsePayload(payload: unknown, partial = false) {
  const parsed = partial ? coursePayloadSchema.partial().safeParse(payload) : createCourseSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Os dados do curso são inválidos." };
  }

  const typeError = validateCourseTypeFields(parsed.data);
  if (typeError) return { error: typeError };
  return { data: parsed.data };
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado.", code: "AUTH_REQUIRED" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");

    const email = admin.user.email?.toLowerCase();
    const isGlobal = email === "palafozanderson@gmail.com" || admin.user.role === "admin" || admin.user.role === "super_admin";
    const instructorFilter = !isGlobal ? admin.user.name || email : null;

    if (mode === "trash") {
      const trash = await getTrashCourses(instructorFilter);
      return NextResponse.json(trash);
    }

    const courses = await getCourses(instructorFilter);
    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json({ error: "Não foi possível carregar os cursos.", code: "COURSES_FETCH_FAILED" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado.", code: "AUTH_REQUIRED" }, { status: 401 });
    }

    const payload = parsePayload(await request.json());
    if (payload.error || !payload.data) return NextResponse.json({ error: payload.error || "Os dados do curso são inválidos.", code: "COURSE_VALIDATION_FAILED" }, { status: 400 });

    const course = await createCourse(payload.data as unknown as Parameters<typeof createCourse>[0]);
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível criar o curso.", code: "COURSE_CREATE_FAILED" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado.", code: "AUTH_REQUIRED" }, { status: 401 });
    }

    const body = await request.json();
    const id = Number(body?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "O ID do curso é inválido.", code: "COURSE_ID_INVALID" }, { status: 400 });
    }

    const payload = parsePayload(Object.fromEntries(Object.entries(body).filter(([key]) => key !== "id")), true);
    if (payload.error || !payload.data) return NextResponse.json({ error: payload.error || "Os dados do curso são inválidos.", code: "COURSE_VALIDATION_FAILED" }, { status: 400 });

    const allowed = await canManageCourse(admin, id);
    if (!allowed) {
      return NextResponse.json({ error: "Professores só podem gerenciar seus próprios cursos.", code: "COURSE_FORBIDDEN" }, { status: 403 });
    }

    const course = await updateCourse(id, payload.data as unknown as Parameters<typeof updateCourse>[1]);
    return NextResponse.json(course);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível atualizar o curso.", code: "COURSE_UPDATE_FAILED" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado.", code: "AUTH_REQUIRED" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const permanent = searchParams.get("permanent") === "true";
    const restore = searchParams.get("restore") === "true";

    if (!id) {
      return NextResponse.json({ error: "ID do curso é obrigatório.", code: "COURSE_ID_REQUIRED" }, { status: 400 });
    }

    const courseId = Number(id);
    if (!Number.isInteger(courseId) || courseId <= 0) {
      return NextResponse.json({ error: "O ID do curso é inválido.", code: "COURSE_ID_INVALID" }, { status: 400 });
    }

    const allowed = await canManageCourse(admin, courseId);
    if (!allowed) {
      return NextResponse.json({ error: "Professores só podem gerenciar seus próprios cursos.", code: "COURSE_FORBIDDEN" }, { status: 403 });
    }

    if (restore) return NextResponse.json(await restoreCourse(courseId));
    if (permanent) return NextResponse.json(await deleteCourse(courseId));
    return NextResponse.json(await softDeleteCourse(courseId));
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível alterar a lixeira do curso.", code: "COURSE_DELETE_FAILED" }, { status: 500 });
  }
}
