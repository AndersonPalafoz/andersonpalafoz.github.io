import { db } from "../lib/db";
import { courses, modules, lessons, users, enrollments, externalClasses, externalStudents } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Iniciando seed completo do ecossistema acadêmico...");

  // 1. Garantir usuário professor/admin e aluno de teste
  const adminEmail = "palafozanderson@gmail.com";
  let teacher = await db.query.users.findFirst({ where: eq(users.email, adminEmail) });
  if (!teacher) {
    const insertedTeacher = await db.insert(users).values({
      name: "Anderson Palafoz",
      email: adminEmail,
      role: "admin",
    }).returning();
    teacher = insertedTeacher[0];
  }

  const studentEmail = "aluno.exemplo@andersonpalafoz.com";
  let student = await db.query.users.findFirst({ where: eq(users.email, studentEmail) });
  if (!student) {
    const insertedStudent = await db.insert(users).values({
      openId: `student_${Date.now()}`,
      name: "Estudante Exemplo",
      email: studentEmail,
      role: "user",
      approvalStatus: "approved",
    }).returning();
    student = insertedStudent[0];
  }

  // 2. Criar ou atualizar 4 cursos internos com múltiplos módulos e aulas reais
  const internalCoursesData = [
    {
      title: "Fundamentos da Morfologia e Sintaxe em Inglês",
      level: "C1",
      category: "Linguística",
      description: "Curso avançado focado na análise morfológica e sintática de estruturas frasais.",
      isFree: true,
      modulesData: [
        { title: "Módulo 1: Morfologia Avançada", desc: "Estrutura de palavras e morfemas derivacionais.", lessons: ["Aula 1: Raízes e Afixos", "Aula 2: Derivação e Composição"] },
        { title: "Módulo 2: Sintaxe Frasal", desc: "Sintagmas nominais e verbais.", lessons: ["Aula 1: O Sintagma Nominal", "Aula 2: Complementação Verbal"] },
        { title: "Módulo 3: Orações Subordinadas", desc: "Estruturas complexas no discurso acadêmico.", lessons: ["Aula 1: Subordinadas Adjetivas", "Aula 2: Subordinadas Adverbiais"] },
        { title: "Módulo 4: Análise Crítica do Discurso", desc: "Aplicação prática em textos literários e científicos.", lessons: ["Aula 1: Coesão e Coerência", "Aula 2: Seminário de Encerramento"] },
      ],
    },
    {
      title: "Inglês Instrumental para Leitura Acadêmica",
      level: "B2",
      category: "Leitura",
      description: "Desenvolvimento de estratégias de leitura e reconhecimento de cognatos para textos científicos.",
      isFree: true,
      modulesData: [
        { title: "Módulo 1: Estratégias de Skimming e Scanning", desc: "Leitura dinâmica e localização de informações.", lessons: ["Aula 1: Introdução ao Skimming", "Aula 2: Prática de Scanning"] },
        { title: "Módulo 2: Falsos Amigos e Cognatos", desc: "Evitando armadilhas lexicais em textos acadêmicos.", lessons: ["Aula 1: Falsos Cognatos Comuns", "Aula 2: Vocabulário Técnico"] },
        { title: "Módulo 3: Marcadores Discursivos", desc: "Conectivos e lógica textual.", lessons: ["Aula 1: Conectivos de Oposição", "Aula 2: Conectivos de Causa e Efeito"] },
      ],
    },
    {
      title: "Alfabetização e Letramento Étnico-Racial em Inglês",
      level: "B1",
      category: "Cultura",
      description: "Estudo crítico de representaciones sociais, literatura afro-americana e quadrinhos pedagógicos.",
      isFree: false,
      price: "197.00",
      modulesData: [
        { title: "Módulo 1: Representação e Identidade", desc: "Conceitos fundamentais de letramento racial.", lessons: ["Aula 1: Introdução ao Letramento", "Aula 2: Vozes Literárias"] },
        { title: "Módulo 2: Quadrinhos como Ferramenta Pedagógica", desc: "Uso de HQs na sala de aula de inglês.", lessons: ["Aula 1: Semiótica dos Quadrinhos", "Aula 2: Análise de Obras"] },
        { title: "Módulo 3: Literatura Afro-Americana", desc: "Autores clássicos e contemporâneos.", lessons: ["Aula 1: Poesia e Resistência", "Aula 2: Narrativas Contemporâneas"] },
        { title: "Módulo 4: Projeto Prático de Ensino", desc: "Elaboração de sequência didática.", lessons: ["Aula 1: Planejamento de Unidade", "Aula 2: Apresentação de Projetos"] },
      ],
    },
    {
      title: "Gramática Prática e Discurso Comunicativo (ESA Model)",
      level: "A2",
      category: "Gramática",
      description: "Aplicação prática do modelo Engage, Study, Activate para ensino dinâmico.",
      isFree: true,
      modulesData: [
        { title: "Módulo 1: Engage - Despertando o Interesse", desc: "Técnicas de aquecimento em sala de aula.", lessons: ["Aula 1: Warm-ups Dinâmicos", "Aula 2: Contextualização"] },
        { title: "Módulo 2: Study - Foco Estrutural", desc: "Apresentação clara de regras gramaticais.", lessons: ["Aula 1: Quadro e Indução", "Aula 2: Prática Guiada"] },
        { title: "Módulo 3: Activate - Fluência Comunicativa", desc: "Atividades livres de conversação.", lessons: ["Aula 1: Role-plays", "Aula 2: Debates Dirigidos"] },
        { title: "Módulo 4: Avaliação Formativa", desc: "Feedback construtivo e checagem de progresso.", lessons: ["Aula 1: Quizzes Interativos", "Aula 2: Autoavaliação"] },
        { title: "Módulo 5: Fechamento de Módulo", desc: "Síntese dos aprendizados ESA.", lessons: ["Aula 1: Revisão Geral", "Aula 2: Conclusão do Curso"] },
      ],
    },
  ];

  for (const cData of internalCoursesData) {
    // Verificar se curso já existe
    let course = await db.query.courses.findFirst({ where: eq(courses.title, cData.title) });
    if (!course) {
      const inserted = await db.insert(courses).values({
        title: cData.title,
        level: cData.level,
        category: cData.category,
        description: cData.description,
        isFree: cData.isFree,
        price: cData.price || "0.00",
        modules: cData.modulesData.length,
        instructor: "Anderson Palafoz",
      }).returning();
      course = inserted[0];
    }

    // Matricular aluno de teste se ainda não estiver matriculado
    const existingEnrollment = await db.query.enrollments.findFirst({
      where: eq(enrollments.courseId, course.id),
    });
    if (!existingEnrollment && student) {
      await db.insert(enrollments).values({
        userId: student.id,
        courseId: course.id,
        progress: 25,
        currentModule: 1,
        status: "active",
      });
    }

    // Criar módulos e aulas se não existirem
    for (let mIdx = 0; mIdx < cData.modulesData.length; mIdx++) {
      const modInfo = cData.modulesData[mIdx];
      let mod = await db.query.modules.findFirst({
        where: eq(modules.courseId, course.id),
      });
      // Inserir módulo se não houver match exato por título
      const allMods = await db.query.modules.findMany({ where: eq(modules.courseId, course.id) });
      let foundMod = allMods.find(m => m.title === modInfo.title);
      if (!foundMod) {
        const insMod = await db.insert(modules).values({
          courseId: course.id,
          title: modInfo.title,
          description: modInfo.desc,
          order: mIdx + 1,
        }).returning();
        foundMod = insMod[0];
      }

      // Inserir aulas
      for (let lIdx = 0; lIdx < modInfo.lessons.length; lIdx++) {
        const lessonTitle = modInfo.lessons[lIdx];
        const allLessons = await db.query.lessons.findMany({ where: eq(lessons.moduleId, foundMod.id) });
        if (!allLessons.some(l => l.title === lessonTitle)) {
          await db.insert(lessons).values({
            moduleId: foundMod.id,
            title: lessonTitle,
            description: `Conteúdo prático da ${lessonTitle}.`,
            videoUrl: "https://www.youtube.com/watch?v=sample",
            duration: 45,
            order: lIdx + 1,
            content: "Material de estudo detalhado, exercícios e orientações de pronúncia.",
          });
        }
      }
    }
  }

  // 3. Criar turma externa robusta com alunos reais
  let extClass = await db.query.externalClasses.findFirst({
    where: eq(externalClasses.className, "Turma Especial de Linguística 2026.1"),
  });
  if (!extClass) {
    const insertedClass = await db.insert(externalClasses).values({
      teacherId: teacher.id,
      institution: "UFBA",
      className: "Turma Especial de Linguística 2026.1",
      courseName: "Morfossintaxe da Língua Inglesa",
      academicTerm: "2026.1",
      description: "Turma avançada para alunos do curso de Letras da UFBA.",
    }).returning();
    extClass = insertedClass[0];

    // Inserir alunos reais na turma externa
    const studentsList = [
      { name: "Beatriz Santos Lima", email: "beatriz.lima@student.ufba.br", idNumber: "20261011", status: "active", notes: "Excelente participação em sala." },
      { name: "Lucas Gabriel Oliveira", email: "lucas.oliveira@student.ufba.br", idNumber: "20261012", status: "active", notes: "Monitor da disciplina." },
      { name: "Mariana Costa Souza", email: "mariana.souza@student.ufba.br", idNumber: "20261013", status: "active", notes: "Foco em pesquisa acadêmica." },
      { name: "Rafael Almeida Ribeiro", email: "rafael.ribeiro@student.ufba.br", idNumber: "20261014", status: "active", notes: "Ótimo desempenho em speaking." },
    ];

    for (const st of studentsList) {
      await db.insert(externalStudents).values({
        externalClassId: extClass.id,
        name: st.name,
        email: st.email,
        idNumber: st.idNumber,
        status: st.status,
        notes: st.notes,
      });
    }
  }

  console.log("Seed completo executado com sucesso!");
}

main().catch((err) => {
  console.error("Erro no seed completo:", err);
  process.exit(1);
});
