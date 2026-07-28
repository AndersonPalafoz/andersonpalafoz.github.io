import { NextResponse } from "next/server";
import { getMaterialById, incrementMaterialDownloads } from "@/lib/db";

// Endpoint público -- qualquer visitante pode contar um download e
// pegar o link do arquivo, sem precisar estar logado (os materiais
// nesta plataforma são recursos públicos, como o resto de /materiais).
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const materialId = parseInt(id);

    const material = await getMaterialById(materialId);
    if (!material) {
      return NextResponse.json({ error: "Material não encontrado" }, { status: 404 });
    }

    await incrementMaterialDownloads(materialId);

    return NextResponse.json({ success: true, fileUrl: material.fileUrl });
  } catch (error) {
    console.error("Error registering material download:", error);
    return NextResponse.json(
      { error: "Falha ao registrar download" },
      { status: 500 }
    );
  }
}
