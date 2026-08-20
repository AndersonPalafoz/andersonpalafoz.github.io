import { NextRequest, NextResponse } from "next/server";
import { getMaterials, getTrashMaterials, createMaterial, updateMaterial, softDeleteMaterial, restoreMaterial, deleteMaterial } from "@/lib/db";
import { requireAdmin, canManageMaterial } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");

    if (mode === "trash") {
      const trash = await getTrashMaterials();
      return NextResponse.json(trash);
    }

    const materials = await getMaterials();
    return NextResponse.json(materials);
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const material = await createMaterial(data);
    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error("Error creating material:", error);
    return NextResponse.json({ error: "Failed to create material" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, ...data } = await request.json();
    const material = await updateMaterial(id, data);
    return NextResponse.json(material);
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json({ error: "Failed to update material" }, { status: 500 });
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

    const materialId = parseInt(id);

    const allowed = await canManageMaterial(admin, materialId);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden: professores só podem gerenciar seus próprios materiais." }, { status: 403 });
    }

    if (restore) {
      const restored = await restoreMaterial(materialId);
      return NextResponse.json(restored);
    }

    if (permanent) {
      const deleted = await deleteMaterial(materialId);
      return NextResponse.json(deleted);
    }

    const softDeleted = await softDeleteMaterial(materialId);
    return NextResponse.json(softDeleted);
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json({ error: "Failed to delete material" }, { status: 500 });
  }
}
