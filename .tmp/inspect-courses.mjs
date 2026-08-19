import { db } from "../lib/db.ts";
import { courses, modules, lessons } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";

async function run() {
  console.log("=== INSPEÇÃO DE CURSOS NO BANCO REAL ===");
  try {
    const allCourses = await db.select().from(courses);
    console.log(`Total de cursos: ${allCourses.length}`);
    for (const c of allCourses) {
      console.log(`- Curso ID #${c.id}: "${c.title}" (Slug: ${c.slug}) | Status: ${c.status}`);
      const mods = await db.select().from(modules).where(eq(modules.courseId, c.id));
      console.log(`  Módulos: ${mods.length}`);
    }

    const course6 = await db.query.courses.findFirst({ where: eq(courses.id, 6) });
    console.log("\nConsulta específica para o ID 6:", course6 || "NÃO ENCONTRADO NO BANCO");
  } catch (err) {
    console.error("Erro ao inspecionar cursos:", err);
  }
  process.exit(0);
}

run();
