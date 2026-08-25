import postgres from "postgres";

const templates = [
  {
    path: "/manus-storage/CertificadoIdiomassemFronteiras_UFBA_2025(1)_8095a9b6.docx",
    name: "Modelo Oficial IsF / UFBA 2025",
    category: "external",
    institution: "Rede IsF / Andifes — UFBA",
    includeSiteBranding: false,
  },
  {
    path: "/manus-storage/PROFICI_UFBA_2025_55612f2d.docx",
    name: "Modelo Oficial PROFICI / UFBA",
    category: "external",
    institution: "PROFICI — UFBA",
    includeSiteBranding: false,
  },
  {
    path: "/manus-storage/CERTIFICAD0_e643592d.docx",
    name: "Modelo Institucional de Curso Livre",
    category: "internal",
    institution: "Anderson Palafoz Platform",
    includeSiteBranding: true,
  },
]

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
if (!databaseUrl) throw new Error("NEON_DATABASE_URL/DATABASE_URL não configurada.");
const sql = postgres(databaseUrl, { prepare: false, max: 1 });

try {
  const admins = await sql`
    SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1
  `;
  const createdBy = admins[0]?.id ?? null;

  for (const template of templates) {

    const existing = await sql`
      SELECT id FROM certificate_templates WHERE name = ${template.name} LIMIT 1
    `;
    if (existing.length) {
      await sql`
        UPDATE certificate_templates
        SET category = ${template.category}, institution = ${template.institution},
            "templateUrl" = ${template.path}, "includeSiteBranding" = ${template.includeSiteBranding},
            "fieldMappings" = ${JSON.stringify(fieldMappings)}, "updatedAt" = NOW()
        WHERE id = ${existing[0].id}
      `;
    } else {
      await sql`
        INSERT INTO certificate_templates
          (name, category, institution, "isDefault", "templateUrl", "includeSiteBranding", "fieldMappings", "createdBy")
        VALUES
          (${template.name}, ${template.category}, ${template.institution}, false, ${template.path},
           ${template.includeSiteBranding}, ${JSON.stringify(fieldMappings)}, ${createdBy})
      `;
    }
    console.log(`REGISTERED ${template.name} -> ${template.path}`);
  }
} finally {
  await sql.end({ timeout: 2 });
}
