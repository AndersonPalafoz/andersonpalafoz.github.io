import postgres from "postgres";

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não configurada");
const sql = postgres(connectionString, { prepare: false, max: 1 });
try {
  await sql.begin(async tx => {
    const rows = await tx`
      INSERT INTO courses (
        title, description, level, category, modules, instructor, modality,
        "isFree", price, workload_hours, max_absence_percent, course_type, sync_modality
      ) VALUES (
        ${"__rollback_certificate_course__"},
        ${"Curso cadastrado para emissão de certificado."},
        ${"Intermediário (B1)"},
        ${"Curso Externo / Avulso"},
        ${0},
        ${"Anderson Palafoz"},
        ${"individual"},
        ${false},
        ${0},
        ${40},
        ${25},
        ${1},
        ${"none"}
      ) RETURNING id, title, course_type, sync_modality
    `;
    console.log(JSON.stringify(rows, null, 2));
    throw new Error("ROLLBACK_VALIDATION");
  }).catch(error => {
    if (error?.message !== "ROLLBACK_VALIDATION") throw error;
  });
  console.log("COURSE_INSERT_ROLLBACK_OK");
} finally {
  await sql.end({ timeout: 2 });
}
