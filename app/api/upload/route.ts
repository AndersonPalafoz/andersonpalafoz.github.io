import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateAssessmentImage } from "@/lib/assessment-image";
import { uploadEducationalImage } from "@/lib/media-image";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "professor")) {
      return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const context = String(formData.get("context") || "assessment-image");
    if (!(file instanceof File)) return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });

    if (context === "assessment-image") {
      const imageError = validateAssessmentImage(file.type, file.size);
      if (imageError) return NextResponse.json({ error: imageError }, { status: file.size > 5 * 1024 * 1024 ? 413 : 415 });
    }

    const ownerId = Number.parseInt(session.user.id || "0", 10);
    if (!Number.isInteger(ownerId) || ownerId <= 0) return NextResponse.json({ error: "Usuário inválido" }, { status: 401 });
    const storageContext = context === "course-cover" ? "course" : context === "material" ? "material" : "assessment";
    const uploaded = await uploadEducationalImage(ownerId, file, storageContext);
    return NextResponse.json({ success: true, url: uploaded.url, key: uploaded.objectPath, type: file.type });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro ao realizar upload do arquivo" }, { status: 500 });
  }
}
