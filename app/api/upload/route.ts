import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { assessmentImageExtensions, validateAssessmentImage } from "@/lib/assessment-image";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "professor")) {
      return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const context = formData.get("context");

    if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });

    if (context === "assessment-image") {
      const imageError = validateAssessmentImage(file.type, file.size);
      if (imageError) return NextResponse.json({ error: imageError }, { status: file.size > 5 * 1024 * 1024 ? 413 : 415 });
    } else if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "O arquivo deve ter no máximo 10 MB." }, { status: 413 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = assessmentImageExtensions[file.type] || path.extname(file.name).toLowerCase() || ".bin";
    const filename = `${uniqueSuffix}${ext}`;
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ success: true, url: `/uploads/${filename}`, type: file.type });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Erro ao realizar upload do arquivo" }, { status: 500 });
  }
}
