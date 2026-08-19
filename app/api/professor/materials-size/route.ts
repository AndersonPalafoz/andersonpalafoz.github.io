import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getTeacherMaterials } from "@/lib/teacher";
import { estimateMaterialSize } from "@/lib/material-download";
import { MAX_ZIP_ENTRIES, MAX_ZIP_INPUT_BYTES } from "@/lib/materials-zip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!session?.user || (role !== "professor" && role !== "admin")) {
    return NextResponse.json({ error: "Acesso restrito a professores e administradores." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const rawIds = body?.materialIds;
    if (!Array.isArray(rawIds) || rawIds.length === 0 || rawIds.length > MAX_ZIP_ENTRIES) {
      return NextResponse.json({ error: `Selecione entre 1 e ${MAX_ZIP_ENTRIES} materiais.` }, { status: 400 });
    }

    const materialIds = [...new Set(rawIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))];
    if (materialIds.length !== rawIds.length) {
      return NextResponse.json({ error: "A seleção contém identificadores inválidos ou duplicados." }, { status: 400 });
    }

    const authorizedMaterials = await getTeacherMaterials(session.user.email ?? undefined);
    const byId = new Map(authorizedMaterials.map((material) => [material.id, material]));
    const selectedMaterials = materialIds.map((id) => byId.get(id));
    if (selectedMaterials.some((material) => !material)) {
      return NextResponse.json({ error: "Um ou mais materiais não pertencem ao escopo autorizado deste professor." }, { status: 403 });
    }

    const sizes = await Promise.all(selectedMaterials.map(async (material) => {
      if (!material?.fileUrl) return { id: material?.id ?? 0, bytes: null };
      try {
        return { id: material.id, bytes: await estimateMaterialSize(material.fileUrl) };
      } catch {
        return { id: material.id, bytes: null };
      }
    }));

    const knownBytes = sizes.reduce((sum, item) => sum + (item.bytes ?? 0), 0);
    const unknownCount = sizes.filter((item) => item.bytes === null).length;
    return NextResponse.json({
      totalBytes: knownBytes,
      unknownCount,
      exceedsLimit: knownBytes > MAX_ZIP_INPUT_BYTES,
      limitBytes: MAX_ZIP_INPUT_BYTES,
      items: sizes,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Teacher materials size estimation failed", error);
    return NextResponse.json({ error: "Não foi possível estimar o tamanho dos materiais selecionados." }, { status: 500 });
  }
}
