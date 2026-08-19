import { db } from "../server/db.js";
import { courses, materials } from "../drizzle/schema.js";

async function run() {
  console.log("=== INICIANDO AUDITORIA DE CURSOS E MATERIAIS ===");
  try {
    const allCourses = await db.select().from(courses);
    console.log(`Cursos encontrados no banco: ${allCourses.length}`);
    allCourses.forEach(c => {
      console.log(`- [ID: ${c.id}] ${c.title} (Slug: ${c.slug}, Status: ${c.status})`);
    });

    const allMaterials = await db.select().from(materials);
    console.log(`\nMateriais encontrados no banco: ${allMaterials.length}`);
    allMaterials.forEach(m => {
      console.log(`- [ID: ${m.id}] ${m.title} (Tipo: ${m.type})`);
    });

    console.log("Auditoria concluída com sucesso.");
  } catch (err) {
    console.error("Erro na auditoria:", err);
    process.exit(1);
  }
}

void run();
