import { db } from "../lib/db.js";
import { courses, modules, lessons, materials, lessonMaterials, externalClasses, externalStudents, externalClassMaterials } from "../drizzle/schema.js";

async function main() {
  console.log("Iniciando cadastro real de cursos e materiais...");

  // 1. Criar 4 Cursos Internos
  const courseData = [
    {
      title: "Fundamentos da Morfologia e Sintaxe em Inglês",
      slug: "fundamentos-morfologia-sintaxe-ingles",
      description: "Curso avançado focado na análise morfológica e sintática de estruturas frasais da língua inglesa, ideal para estudantes de Letras e professores.",
      level: "Intermediário ao Avançado",
      status: "published",
      estimatedHours: 40,
    },
    {
      title: "Inglês Instrumental para Leitura Acadêmica",
      slug: "ingles-instrumental-leitura-academica",
      description: "Desenvolvimento de estratégias de leitura, reconhecimento de cognatos, falsos amigos e análise discursiva para textos acadêmicos e científicos.",
      level: "Básico ao Avançado",
      status: "published",
      estimatedHours: 30,
    },
    {
      title: "Alfabetização Letramento Étnico-Racial em Língua Inglesa",
      slug: "alfabetizacao-letramento-etnico-racial-lingua-inglesa",
      description: "Estudo crítico de representações sociais, literatura afro-americana e quadrinhos como ferramentas pedagógicas no ensino de inglês.",
      level: "Intermediário",
      status: "published",
      estimatedHours: 35,
    },
    {
      title: "Gramática Prática e Discurso Comunicativo (ESA Model)",
      slug: "gramatica-pratica-discurso-comunicativo-esa",
      description: "Aplicação prática do modelo Engage, Study, Activate (ESA) para o ensino dinâmico de gramática e fluência conversacional.",
      level: "Básico ao Avançado",
      status: "published",
      estimatedHours: 45,
    },
  ];

  const createdCourses = [];
  for (const c of courseData) {
    const [inserted] = await db.insert(courses).values(c).returning();
    createdCourses.push(inserted);
    console.log(`Curso criado: ${inserted.title} (ID: ${inserted.id})`);
  }

  // 2. Criar materiais didáticos reais associados
  const materialData = [
    {
      title: "Guia de Sintaxe: Frases Complexas e Oração Subordinada",
      description: "Material em PDF com análise detalhada de orações subordinadas substantivas e adjetivas em inglês.",
      type: "pdf",
      level: "Intermediário ao Avançado",
      driveUrl: "https://drive.google.com/file/d/sample-syntax-guide/view",
      status: "published",
    },
    {
      title: "Worksheet: Cognatos e Estratégias de Skimming & Scanning",
      description: "Folha de exercícios práticos para leitura dinâmica de artigos científicos em inglês.",
      type: "worksheet",
      level: "Básico ao Avançado",
      driveUrl: "https://drive.google.com/file/d/sample-reading-worksheet/view",
      status: "published",
    },
    {
      title: "Slides: Quadrinhos como Ferramenta Pedagógica (Etnicidade)",
      description: "Apresentação visual para uso em sala de aula abordando representação étnico-racial em HQs.",
      type: "slides",
      level: "Intermediário",
      driveUrl: "https://drive.google.com/file/d/sample-comics-slides/view",
      status: "published",
    },
    {
      title: "Áudio e Transcrição: Prática Conversacional ESA (Módulo 1)",
      description: "Gravação de áudio com diálogo contextualizado seguindo o modelo Engage, Study, Activate.",
      type: "audio",
      level: "Básico ao Avançado",
      driveUrl: "https://drive.google.com/file/d/sample-esa-audio/view",
      status: "published",
    },
  ];

  const createdMaterials = [];
  for (const m of materialData) {
    const [inserted] = await db.insert(materials).values(m).returning();
    createdMaterials.push(inserted);
    console.log(`Material criado: ${inserted.title} (ID: ${inserted.id})`);
  }

  // 3. Criar Módulos e Aulas para os Cursos e vincular materiais
  for (let i = 0; i < createdCourses.length; i++) {
    const course = createdCourses[i];
    const [mod] = await db.insert(modules).values({
      courseId: course.id,
      title: `Módulo 1: Introdução e Fundamentos de ${course.title}`,
      description: `Visão geral e conceitos estruturais do curso ${course.title}.`,
      position: 1,
    }).returning();

    const [lesson] = await db.insert(lessons).values({
      moduleId: mod.id,
      title: `Aula 1: Conceitos Chave e Aplicação Prática`,
      slug: `aula-1-${course.slug}`,
      description: `Primeira aula do curso ${course.title} aplicando a metodologia estabelecida.`,
      objectives: "Compreender os fundamentos e iniciar a aplicação prática imediata.",
      content: "Conteúdo estruturado em Markdown com explicação teórica, exemplos contextualizados e exercícios.",
      videoUrl: "dQw4w9WgXcQ",
      position: 1,
      status: "published",
    }).returning();

    // Vincular material correspondente
    const mat = createdMaterials[i];
    if (mat) {
      await db.insert(lessonMaterials).values({
        lessonId: lesson.id,
        materialId: mat.id,
      });
      console.log(`Material ID ${mat.id} vinculado à aula ID ${lesson.id}`);
    }
  }

  // 4. Criar Turma Externa (ex: UFBA - Letras Inglês / Projeto SIMAL)
  const [extClass] = await db.insert(externalClasses).values({
    institution: "UFBA / Projeto SIMAL",
    className: "Turma Especial de Sintaxe Inglesa 2026.1",
    courseName: "Morfossintaxe Aplicada ao Ensino",
    academicTerm: "2026.1",
    teacherId: 1, // Anderson (assumindo id 1 ou primeiro admin)
    description: "Turma externa cadastrada para controle unificado de frequência, chamadas e notas de alunos vinculados.",
  }).returning();

  console.log(`Turma externa criada: ${extClass.className} (ID: ${extClass.id})`);

  // Adicionar alunos de exemplo na turma externa
  const studentsData = [
    { name: "Beatriz Santos Lima", email: "beatriz.lima@student.edu", studentIdNumber: "202610191" },
    { name: "Lucas Gabriel Oliveira", email: "lucas.oliveira@student.edu", studentIdNumber: "202610192" },
    { name: "Mariana Costa Souza", email: "mariana.souza@student.edu", studentIdNumber: "202610193" },
  ];

  for (const s of studentsData) {
    await db.insert(externalStudents).values({
      externalClassId: extClass.id,
      name: s.name,
      email: s.email,
      studentIdNumber: s.studentIdNumber,
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
