import { createCourse, createMaterial, createArticle } from "./lib/db";

async function run() {
  console.log("Iniciando inserção via lib/db.ts...");

  const course = await createCourse({
    title: "English Mastery: Módulo de Teste & Pronúncia Avançada",
    description: "Curso prático desenvolvido por Anderson Palafoz para treinar competência comunicativa, fonética e fluência no cotidiano acadêmico.",
    level: "B1",
    modules: 4,
    instructor: "Anderson Palafoz",
  });
  console.log("Curso criado:", course);

  const article = await createArticle({
    title: "Estratégias de Letramento e Fluência no Ensino de Língua Inglesa",
    slug: "estrategias-de-letramento-e-fluencia-no-ensino-de-lingua-inglesa-" + Date.now(),
    content: "Neste artigo acadêmico, discutimos como a integração entre materiais visuais e fonética aplicada transforma o processo de aquisição da segunda língua em turmas de nível intermediário.",
    category: "Linguística & Ensino",
    readingTime: 6,
    published: new Date(),
  });
  console.log("Post de blog criado:", article);

  const material = await createMaterial({
    title: "Worksheet Prática: Everyday Vocabulary & Phrasal Verbs (B1)",
    description: "Material autoral contendo exercícios contextuais, glossário ilustrado e chave de respostas para fixação de vocabulário intermediário.",
    category: "Worksheets",
    level: "B1",
    fileUrl: "https://andersonpalafoz.com.br/materiais/everyday-vocabulary-b1.pdf",
  });
  console.log("Material criado:", material);

  console.log("Todos os itens de teste foram criados com sucesso!");
  process.exit(0);
}

run().catch((err) => {
  console.error("Erro ao inserir itens de teste:", err);
  process.exit(1);
});
