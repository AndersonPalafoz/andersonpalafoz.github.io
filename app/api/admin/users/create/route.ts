import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, enrollments } from "@/drizzle/schema";

// POST /api/admin/users/create - Criar novo usuario
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, name, role } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Missing email or name" },
        { status: 400 }
      );
    }

    if (!["user", "admin"].includes(role || "user")) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Verificar se usuario ja existe
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Criar novo usuario
    const newUser = await db
      .insert(users)
      .values({
        email,
        name,
        role: role || "user",
        openId: `manual-${Date.now()}-${Math.random()}`,
        loginMethod: "admin-created",
      })
      .returning();

    // Se novo usuario eh aluno, inscrever em todos os cursos com 0% progresso
    if ((role || "user") === "user" && newUser.length > 0) {
      const allCourses = await db.query.courses.findMany();

      for (const course of allCourses) {
        await db.insert(enrollments).values({
          userId: newUser[0].id,
          courseId: course.id,
          progress: 0,
          currentModule: 0,
          status: "active",
        });
      }
    }

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name,
        role: newUser[0].role,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
