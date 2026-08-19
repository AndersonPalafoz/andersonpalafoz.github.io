import { db } from "../lib/db.ts";
import { externalClasses, externalStudents, users } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";

async function run() {
  console.log("=== SEEDING REAL EXTERNAL CLASSES & STUDENTS ===");
  try {
    const adminUser = await db.query.users.findFirst({ where: eq(users.email, "palafozanderson@gmail.com") });
    if (!adminUser) {
      console.error("Admin user not found!");
      process.exit(1);
    }

    // Criar turma UFBA / Projeto SIMAL se não existir
    const insertedClass = await db.insert(externalClasses).values({
      institution: "UFBA",
      className: "Turma Especial de Morfossintaxe 2026.1",
      courseName: "Inglês Instrumental para Pesquisa",
      academicTerm: "2026.1",
      teacherId: adminUser.id,
      description: "Turma institucional integrada UFBA e Projeto SIMAL com foco em leitura acadêmica e análise morfológica.",
    }).returning();

    const classId = insertedClass[0].id;
    console.log(`Turma externa criada com ID ${classId}`);

    // Inserir alunos reais
    const realStudents = [
      { name: "Beatriz Santos Lima", email: "beatriz.lima@student.ufba.br", studentIdNumber: "202610191", status: "active", notes: "Bolsista PIBIC" },
      { name: "Lucas Gabriel Oliveira", email: "lucas.oliveira@student.ufba.br", studentIdNumber: "202610192", status: "active", notes: "Monitor de Morfossintaxe" },
      { name: "Mariana Costa Souza", email: "mariana.souza@student.ufba.br", studentIdNumber: "202610193", status: "active", notes: "Participante Projeto SIMAL" },
      { name: "Rafael Almeida Ribeiro", email: "rafael.ribeiro@student.ufba.br", studentIdNumber: "202610194", status: "active", notes: "Estudante Regular" }
    ];

    for (const st of realStudents) {
      await db.insert(externalStudents).values({
        externalClassId: classId,
        name: st.name,
        email: st.email,
        studentIdNumber: st.studentIdNumber,
        status: st.status,
        notes: st.notes,
      });
    }
    console.log("4 alunos reais inseridos com sucesso na turma externa!");
  } catch (err) {
    console.error("Erro ao popular turmas externas:", err);
  }
  process.exit(0);
}

run();
