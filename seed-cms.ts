import { db } from './lib/db';
import { siteContentBlocks } from './drizzle/schema';

async function seed() {
  try {
    console.log("Seeding default CMS blocks...");
    const defaults = [
      { pageKey: 'home', sectionKey: 'hero_title', title: 'Título Principal da Home', content: 'Aprenda Inglês com Anderson Palafoz', status: 'published', contentType: 'text', tag: 'Home' },
      { pageKey: 'home', sectionKey: 'hero_subtitle', title: 'Subtítulo da Home', content: 'Plataforma educacional completa com aulas, materiais exclusivos e conteúdo acadêmico de alta qualidade. Aulas organizadas do A1 ao B2 e materiais que podem chegar aos níveis C1 e C2.', status: 'published', contentType: 'text', tag: 'Home' },
      { pageKey: 'sobre', sectionKey: 'bio_title', title: 'Título da Página Sobre', content: 'Anderson Bacelar Palafoz — Professor e Pesquisador', status: 'published', contentType: 'text', tag: 'Sobre' },
    ];

    for (const item of defaults) {
      await db.insert(siteContentBlocks).values(item).onConflictDoNothing();
    }
    console.log("CMS default blocks seeded successfully!");
  } catch (err) {
    console.error("Seed error:", err);
  }
  process.exit(0);
}

seed();
