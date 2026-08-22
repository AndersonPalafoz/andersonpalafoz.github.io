import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { certificateTemplates, users } from "@/drizzle/schema";
import { db, getCertificateTemplates } from "@/lib/db";
import { requireTeacherOrAdmin } from "@/lib/admin-auth";
import { uploadCertificateTemplate } from "@/lib/learning-storage";

export const dynamic = "force-dynamic";

function isElevated(
  session: Awaited<ReturnType<typeof requireTeacherOrAdmin>>
) {
  const role = session?.user?.role;
  const email = session?.user?.email?.toLowerCase();
  return Boolean(
    session &&
      (email === "palafozanderson@gmail.com" ||
        role === "admin" ||
        role === "super_admin")
  );
}

function parseBoolean(value: FormDataEntryValue | null, fallback: boolean) {
  if (value === null) return fallback;
  return value === "true" || value === "1" || value === "on";
}

function parseFieldMappings(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string" || !value.trim()) return null;
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      throw new Error("invalid");
    return JSON.stringify(parsed);
  } catch {
    throw new Error("O mapeamento de campos deve ser um objeto JSON válido.");
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireTeacherOrAdmin();
    if (!isElevated(session))
      return NextResponse.json(
        { error: "Acesso restrito ao administrador." },
        { status: 403 }
      );

    const category = request.nextUrl.searchParams.get("category") || undefined;
    const templates = await getCertificateTemplates(category).catch(err => {
      console.error("Failed to query certificate templates:", err);
      return [];
    });
    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error("Error in GET /api/admin/certificate-templates:", error);
    return NextResponse.json(
      {
        success: false,
        templates: [],
        error: error instanceof Error ? error.message : "Erro interno ao carregar modelos.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireTeacherOrAdmin();
    if (!isElevated(session))
      return NextResponse.json(
        { error: "Acesso restrito ao administrador." },
        { status: 403 }
      );

    const email = session?.user?.email?.toLowerCase();
    const creator = email
      ? await db.query.users.findFirst({ where: eq(users.email, email) })
      : null;
    if (!creator)
      return NextResponse.json(
        { error: "Usuário administrador não encontrado." },
        { status: 403 }
      );

    const formData = await request.formData();
    const name = String(formData.get("name") || "").trim();
    const category = String(formData.get("category") || "internal")
      .trim()
      .toLowerCase();
    const institution =
      String(formData.get("institution") || "").trim() || null;
    const isDefault = parseBoolean(formData.get("isDefault"), false);
    const includeSiteBranding = parseBoolean(
      formData.get("includeSiteBranding"),
      category === "internal"
    );
    const fieldMappings = parseFieldMappings(formData.get("fieldMappings"));
    const file = formData.get("file");

    if (name.length < 2 || name.length > 180)
      return NextResponse.json(
        { error: "Informe um nome de modelo entre 2 e 180 caracteres." },
        { status: 400 }
      );
    if (category !== "internal" && category !== "external")
      return NextResponse.json(
        { error: "A categoria deve ser internal ou external." },
        { status: 400 }
      );
    if (!(file instanceof File))
      return NextResponse.json(
        { error: "Envie o arquivo do modelo em PDF, PNG ou DOCX." },
        { status: 400 }
      );

    const uploaded = await uploadCertificateTemplate(creator.id, file);

    if (isDefault) {
      await db
        .update(certificateTemplates)
        .set({ isDefault: false })
        .where(eq(certificateTemplates.category, category));
    }

    const [template] = await db
      .insert(certificateTemplates)
      .values({
        name,
        category,
        institution,
        isDefault,
        templateUrl: uploaded.objectPath,
        includeSiteBranding,
        fieldMappings,
        createdBy: creator.id,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        template,
        message: "Modelo de certificado cadastrado com sucesso.",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível cadastrar o modelo.",
      },
      { status: 400 }
    );
  }
}
