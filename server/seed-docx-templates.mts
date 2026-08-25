import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";

const TEMPLATE_BUCKET = "certificate-templates";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const templates = [
  {
    file: "/home/ubuntu/upload/CertificadoIdiomassemFronteiras_UFBA_2025(1).docx",
    name: "Modelo Oficial IsF / UFBA 2025",
    category: "external",
    institution: "Rede IsF / Andifes — UFBA",
    includeSiteBranding: false,
  },
  {
    file: "/home/ubuntu/upload/CertificadoparaCursodeInglêsparaFinsdeInternacionalização.docx",
    name: "Modelo Oficial PROFICI / UFBA",
    category: "external",
    institution: "PROFICI — UFBA",
    includeSiteBranding: false,
  },
  {
    file: "/home/ubuntu/upload/CERTIFICAD0.docx",
    name: "Modelo Institucional de Curso Livre",
    category: "internal",
    institution: "Anderson Palafoz Platform",
    includeSiteBranding: true,
  },
] as const;

const fieldMappings = {
  studentName: { x: 250, y: 190, size: 22, maxWidth: 520 },
  courseTitle: { x: 280, y: 260, size: 16, maxWidth: 480 },
  level: { x: 300, y: 300, size: 13, maxWidth: 300 },
  issuedAt: { x: 70, y: 430, size: 11, maxWidth: 180 },
  certificateCode: { x: 560, y: 430, size: 11, maxWidth: 200 },
  workloadHours: { x: 300, y: 330, size: 12, maxWidth: 180 },
  studentCpf: { x: 250, y: 225, size: 12, maxWidth: 220 },
  period: { x: 300, y: 360, size: 12, maxWidth: 240 },
  coordinatorName: { x: 480, y: 430, size: 11, maxWidth: 200 },
  institutionName: { x: 70, y: 80, size: 12, maxWidth: 300 },
  signature: { x: 470, y: 390, size: 12, maxWidth: 240 },
};

const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!databaseUrl || !supabaseUrl || !serviceRoleKey) {
  throw new Error("NEON_DATABASE_URL/DATABASE_URL e Supabase admin são obrigatórios.");
}

const sql = postgres(databaseUrl, { prepare: false, max: 1 });
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

try {
  const admins = await sql`
    SELECT id FROM users
    WHERE role IN ('admin', 'super_admin')
    ORDER BY id ASC
    LIMIT 1
  `;
  const createdBy = admins[0]?.id ?? null;

  const { data: bucket } = await supabase.storage.getBucket(TEMPLATE_BUCKET);
  if (!bucket) {
    const { error } = await supabase.storage.createBucket(TEMPLATE_BUCKET, {
      public: false,
      allowedMimeTypes: [DOCX_MIME],
      fileSizeLimit: "10485760B",
    });
    if (error && !/already exists|duplicate/i.test(error.message)) throw error;
  }

  for (const template of templates) {
    const bytes = await readFile(template.file);
    const safeName = basename(template.file).replace(/[^a-zA-Z0-9._-]/g, "-");
    const objectPath = `seed/institutional/${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from(TEMPLATE_BUCKET)
      .upload(objectPath, bytes, { contentType: DOCX_MIME, upsert: true });
    if (uploadError) throw uploadError;

    const existing = await sql`
      SELECT id FROM certificate_templates WHERE name = ${template.name} LIMIT 1
    `;
    if (existing.length) {
      await sql`
        UPDATE certificate_templates
        SET category = ${template.category}, institution = ${template.institution},
            "templateUrl" = ${objectPath}, "includeSiteBranding" = ${template.includeSiteBranding},
            "fieldMappings" = ${JSON.stringify(fieldMappings)}, "updatedAt" = NOW()
        WHERE id = ${existing[0].id}
      `;
    } else {
      await sql`
        INSERT INTO certificate_templates
          (name, category, institution, "isDefault", "templateUrl", "includeSiteBranding", "fieldMappings", "createdBy")
        VALUES
          (${template.name}, ${template.category}, ${template.institution}, false, ${objectPath},
           ${template.includeSiteBranding}, ${JSON.stringify(fieldMappings)}, ${createdBy})
      `;
    }
    console.log(`REGISTERED ${template.name} -> ${objectPath}`);
  }
} finally {
  await sql.end({ timeout: 2 });
}
