import { db } from "../lib/db";
import { courses, modules, lessons, materials, externalClasses, externalStudents, users } from "../drizzle/schema";
import { isNull } from "drizzle-orm";

async function main() {
  console.log("Iniciando cadastro real de cursos, materiais e turmas externas (schema compatível)...");

  // Localizar ID do admin/professor Anderson
  const adminUser = await db.query.users.findFirst({
    where: isNull(users.deletedAt),
  });
  const teacherId = adminUser ? adminUser.id : 1;

  // 1. Criar 4 Cursos Internos reais
  const courseData = [
    {
      title: "Fundamentos da Morfologia e Sintaxe em Inglês",
      description: "Curso avançado focado na análise morfológica e sintática de estruturas frasais da língua inglesa, ideal para estudantes de Letras e professores.",
      level: "C1",
      category: "Lingüística",
      modules: 4,
      instructor: "Anderson Palafoz",
      modality: "individual",
      isFree: true,
      price: "0",
    },
    {
      title: "Inglês Instrumental para Leitura Acadêmica",
      description: "Desenvolvimento de estratégias de leitura, reconhecimento de cognatos, falsos amigos e análise discursiva para textos acadêmicos e científicos.",
      level: "B2",
      category: "Leitura Acadêmica",
      modules: 3,
      instructor: "Anderson Palafoz",
      modality: "group",
      isFree: true,
      price: "0",
    },
    {
      title: "Alfabetização Letramento Étnico-Racial em Língua Inglesa",
      description: "Estudo crítico de representações sociais, literatura afro-americana e quadrinhos como ferramentas pedagógicas no ensino de inglês.",
      level: "B1",
      category: "Letramento",
      modules: 4,
      instructor: "Anderson Palafoz",
      modality: "hybrid",
      isFree: false,
      price: "197.00",
    },
    {
      title: "Gramática Prática e Discurso Comunicativo (ESA Model)",
      description: "Aplicação prática do modelo Engage, Study, Activate (ESA) para o ensino dinâmico de gramática e fluência conversacional.",
      level: "A2",
      category: "Metodologia ESA",
      modules: 5,
      instructor: "Anderson Palafoz",
      modality: "individual",
      isFree: true,
      price: "0",
    },
  ];

  const createdCourses = [];
  for (const c of courseData) {
    const [inserted] = await db.insert(courses).values(c).returning();
    createdCourses.push(inserted);
    console.log(`Curso criado: ${inserted.title} (ID: ${inserted.id})`);
  }

  // 2. Criar materiais didáticos reais associados aos cursos
  const materialData = [
    {
      title: "Guia de Sintaxe: Frases Complexas e Oração Subordinada",
      description: "Material em PDF com análise detalhada de orações subordinadas substantivas e adjetivas em inglês.",
      category: "Worksheets",
      level: "C1",
      fileUrl: "https://drive.google.com/file/d/sample-syntax-guide/view",
      isPublic: true,
      courseId: createdCourses[0].id,
    },
    {
      title: "Worksheet: Cognatos e Estratégias de Skimming & Scanning",
      description: "Folha de exercícios práticos para leitura dinâmica de artigos científicos em inglês.",
      category: "Worksheets",
      level: "B2",
      fileUrl: "https://drive.google.com/file/d/sample-reading-worksheet/view",
      isPublic: true,
      courseId: createdCourses[1].id,
    },
    {
      title: "Slides: Quadrinhos como Ferramenta Pedagógica (Etnicidade)",
      description: "Apresentação visual para uso em sala de aula abordando representação étnico-racial em HQs.",
      category: "Slides",
      level: "B1",
      fileUrl: "https://drive.google.com/file/d/sample-comics-slides/view",
      isPublic: false,
      courseId: createdCourses[2].id,
    },
    {
      title: "Áudio e Transcrição: Prática Conversacional ESA (Módulo 1)",
      description: "Gravação de áudio com diálogo contextualizado seguindo o modelo Engage, Study, Activate.",
      category: "Áudios",
      level: "A2",
      fileUrl: "https://drive.google.com/file/d/sample-esa-audio/view",
      isPublic: true,
      courseId: createdCourses[3].id,
    },
  ];

  for (const m of materialData) {
    const [inserted] = await db.insert(materials).values(m).returning();
    console.log(`Material criado: ${inserted.title} (ID: ${inserted.id})`);
  }

  // 3. Criar Módulos e Aulas para os Cursos
  for (const course of createdCourses) {
    const [mod] = await db.insert(modules).values({
      courseId: course.id,
      title: `Módulo 1: Introdução e Fundamentos`,
      description: `Visão geral e conceitos estruturais do curso.`,
      order: 1,
    }).returning();

    await db.insert(lessons).values({
      moduleId: mod.id,
      title: `Aula 1: Conceitos Chave e Aplicação Prática`,
      description: `Primeira aula aplicando a metodologia estabelecida.`,
      duration: 45,
      order: 1,
      content: "Conteúdo estruturado em Markdown com explicação teórica, exemplos contextualizados e exercícios.",
      videoUrl: "https://www.youtube.com/watch?v=sample",
    });
    console.log(`Módulo e aula criados para o curso ID ${course.id}`);
  }

  // 4. Criar Turma Externa (UFBA / Projeto SIMAL)
  const [extClass] = await db.insert(externalClasses).values({
    institution: "UFBA / Projeto SIMAL",
    className: "Turma Especial de Sintaxe Inglesa 2026.1",
    courseName: "Morfossintaxe Aplicada ao Ensino",
    academicTerm: "2026.1",
    teacherId,
    description: "Turma externa cadastrada para controle unificado de frequência, chamadas e notas de alunos vinculados.",
  }).returning();

  console.log(`Turma externa criada: ${extClass.className} (ID: ${extClass.id})`);

  const studentsData = [
    { name: "Beatriz Santos Lima", email: "beatriz.lima@student.edu", studentIdNumber: "202610191", status: "active", notes: "Bolsista Projeto SIMAL" },
    { name: "Lucas Gabriel Oliveira", email: "lucas.oliveira@student.edu", studentIdNumber: "202610192", status: "active", notes: "Estudante Regular UFBA" },
    { name: "Mariana Costa Souza", email: "mariana.souza@student.edu", studentIdNumber: "202610193", status: "active", notes: "Monitora Voluntária" },
  ];

  for (const s of studentsData) {
    await db.insert(externalStudents).values({
      externalClassId: extClass.id,
      ...s,
    });
  }
  console.log(`3 alunos cadastrados na turma externa ID ${extClass.id}`);

  console.log("Processo de cadastro manual simulado concluído com sucesso!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Erro ao popular dados reais:", err);
  process.exit(1);
});
