import { db } from "../lib/db.ts";
import { externalClasses, externalStudents, users } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";

async function run() {
  console.log("=== INSPEÇÃO DE TURMAS EXTERNAS E ALUNOS ===");
  try {
    const classes = await db.select().from(externalClasses);
    console.log(`Total de turmas externas encontradas: ${classes.length}`);
    for (const c of classes) {
      console.log(`- Turma #${c.id}: ${c.institution} | ${c.className} | ${c.courseName} | Term: ${c.academicTerm} | TeacherId: ${c.teacherId}`);
      const students = await db.select().from(externalStudents).where(eq(externalStudents.externalClassId, c.id));
      console.log(`  Alunos vinculados (${students.length}):`);
      for (const s of students) {
        console.log(`    * [${s.id}] ${s.name} (${s.email || 'sem email'}) - Matrícula: ${s.studentIdNumber || 'N/A'} - Status: ${s.status}`);
      }
    }

    const allUsers = await db.select().from(users);
    console.log(`\nTotal de usuários cadastrados: ${allUsers.length}`);
    for (const u of allUsers) {
      if (u.role === 'admin' || u.role === 'super_admin' || u.email?.includes('palafoz')) {
        console.log(`- Admin/Teacher User: [${u.id}] ${u.name} (${u.email}) - Role: ${u.role}`);
      }
    }
  } catch (err) {
    console.error("Erro ao inspecionar banco:", err);
  }
  process.exit(0);
}

run();
