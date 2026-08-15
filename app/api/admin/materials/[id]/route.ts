import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { materials } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

// PUT /api/admin/materials/[id] - Editar material
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, category, level, description } = body;
    const { id } = await params;
    const materialId = parseInt(id);

    if (!title || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verificar se material existe
    const existingMaterial = await db.query.materials.findFirst({
      where: eq(materials.id, materialId),
    });

    if (!existingMaterial) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    const updatedMaterial = await db
      .update(materials)
      .set({
        title,
        category,
        level: level || null,
        description: description || null,
      })
      .where(eq(materials.id, materialId))
      .returning();

    return NextResponse.json({
      message: "Material updated successfully",
      material: updatedMaterial[0],
    });
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/materials/[id] - Deletar material
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const materialId = parseInt(id);

    // Verificar se material existe
    const existingMaterial = await db.query.materials.findFirst({
      where: eq(materials.id, materialId),
    });

    if (!existingMaterial) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    await db.delete(materials).where(eq(materials.id, materialId));

    return NextResponse.json({
      message: "Material deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
