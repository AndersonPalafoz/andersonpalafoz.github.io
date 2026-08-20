import { NextRequest, NextResponse } from "next/server";
import {
  getMaterials,
  getTrashMaterials,
  createMaterial,
  updateMaterial,
  softDeleteMaterial,
  restoreMaterial,
  deleteMaterial,
} from "@/lib/db";
import { requireAdmin, canManageMaterial, type AdminAuthSession } from "@/lib/admin-auth";

const isGlobalAdmin = (session: AdminAuthSession) => {
  const email = session.user.email?.toLowerCase();
  return email === "palafozanderson@gmail.com" || session.user.role === "admin" || session.user.role === "super_admin";
};

function getScopeId(session: AdminAuthSession) {
  return isGlobalAdmin(session) ? undefined : session.user.id;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const scopeId = getScopeId(admin);
    if (!isGlobalAdmin(admin) && !scopeId) {
      return NextResponse.json({ error: "Sessão de professor sem identificador de autoria." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");
    const materials = mode === "trash" ? await getTrashMaterials(scopeId) : await getMaterials(scopeId);
    return NextResponse.json(materials);
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await request.json();
    const material = await createMaterial({
      ...data,
      instructorId: isGlobalAdmin(admin) ? data.instructorId : admin.user.id,
    });
    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error("Error creating material:", error);
    return NextResponse.json({ error: "Failed to create material" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, ...rawData } = await request.json();
    const materialId = Number(id);
    if (!Number.isInteger(materialId) || materialId <= 0) {
      return NextResponse.json({ error: "ID de material inválido." }, { status: 400 });
    }

    if (!(await canManageMaterial(admin, materialId))) {
      return NextResponse.json({ error: "Forbidden: professores só podem gerenciar seus próprios materiais." }, { status: 403 });
    }

    const data = { ...rawData };
    if (!isGlobalAdmin(admin)) delete data.instructorId;
    const material = await updateMaterial(materialId, data);
    return NextResponse.json(material);
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json({ error: "Failed to update material" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const permanent = searchParams.get("permanent") === "true";
    const restore = searchParams.get("restore") === "true";

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
    const materialId = Number(id);
    if (!Number.isInteger(materialId) || materialId <= 0) {
      return NextResponse.json({ error: "ID de material inválido." }, { status: 400 });
    }

    if (!(await canManageMaterial(admin, materialId))) {
      return NextResponse.json({ error: "Forbidden: professores só podem gerenciar seus próprios materiais." }, { status: 403 });
    }

    if (restore) return NextResponse.json(await restoreMaterial(materialId));
    if (permanent) return NextResponse.json(await deleteMaterial(materialId));
    return NextResponse.json(await softDeleteMaterial(materialId));
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json({ error: "Failed to delete material" }, { status: 500 });
  }
}
