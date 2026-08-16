import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './drizzle/schema.ts';

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_gY5t2JqBvK1e@ep-dry-breeze-a56j1z80-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require";
const sql = neon(connectionString);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("Iniciando inserção de conteúdo de teste...");

  // 1. Criar Curso de Teste
  const courseRes = await db.insert(schema.courses).values({
    title: "English Mastery: Módulo de Teste & Pronúncia Avançada",
    description: "Curso prático desenvolvido por Anderson Palafoz para treinar competência comunicativa, fonética e fluência no cotidiano acadêmico.",
    level: "B1",
    modules: 4,
    instructor: "Anderson Palafoz",
  }).returning();
  console.log("Curso criado com sucesso:", courseRes[0]);

  // 2. Criar Artigo / Post de Blog de Teste
  const articleRes = await db.insert(schema.articles).values({
    title: "Estratégias de Letramento e Fluência no Ensino de Língua Inglesa",
    slug: "estrategias-de-letramento-e-fluencia-no-ensino-de-lingua-inglesa",
    content: "Neste artigo acadêmico, discutimos como a integração entre materiais visuais e fonética aplicada transforma o processo de aquisição da segunda língua em turmas de nível intermediário.",
    category: "Linguística & Ensino",
    readingTime: 6,
    published: new Date(),
  }).returning();
  console.log("Post de blog criado com sucesso:", articleRes[0]);

  // 3. Criar Material Educacional de Teste
  const materialRes = await db.insert(schema.materials).values({
    title: "Worksheet Prática: Everyday Vocabulary & Phrasal Verbs (B1)",
    description: "Material autoral contendo exercícios contextuais, glossário ilustrado e chave de respostas para fixação de vocabulário intermediário.",
    category: "Worksheets",
    level: "B1",
    fileUrl: "https://andersonpalafoz.com.br/materiais/everyday-vocabulary-b1.pdf",
    downloads: 42,
  }).returning();
  console.log("Material criado com sucesso:", materialRes[0]);

  console.log("Conteúdos de teste inseridos com sucesso no banco de dados!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Erro ao inserir conteúdos de teste:", err);
  process.exit(1);
});
