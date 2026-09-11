import Link from "next/link";
import { BlogBrowser } from "@/components/blog-browser";
import { getPublicArticles } from "@/lib/public-content";

export const metadata = {
  title: "Blog | Anderson Palafoz",
  description: "Artigos, dicas e insights sobre ensino de inglês e educação.",
};

export default async function BlogPage() {
  const { articles: allArticles, available } = await getPublicArticles();
  const articles = allArticles.filter((article) => article.published);

  return (
    <div className="w-full">
      <section className="relative flex min-h-[62vh] items-center overflow-hidden bg-white dark:bg-slate-900 px-4 py-20 md:px-8 lg:px-16">
        <div className="pointer-events-none absolute -right-36 top-12 h-80 w-80 rounded-full bg-red-100/60 blur-3xl" />
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-3xl space-y-8">
            <div className="space-y-4">
              <span className="eyebrow">Knowledge Hub</span>
              <h1 className="text-5xl font-bold leading-tight md:text-6xl">Blog de<br /><span className="text-red-600">Inglês e Educação</span></h1>
              <p className="text-lg leading-relaxed text-gray-600 dark:text-slate-400">Artigos, dicas, insights e reflexões sobre ensino de inglês, linguística, educação e tecnologia.</p>
            </div>
            <Link href="#artigos-publicados" className="inline-flex rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2">Explorar artigos</Link>
          </div>
        </div>
      </section>

      <section id="artigos-publicados" className="bg-white dark:bg-slate-900 px-4 py-20 md:px-8 lg:px-16">
        <div className="mx-auto max-w-7xl">
          {!available ? <div className="mx-auto max-w-2xl rounded-2xl border border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center"><h2 className="text-xl font-bold text-gray-900 dark:text-white">Conteúdo temporariamente indisponível</h2><p className="mt-3 text-gray-600 dark:text-slate-400">Estamos atualizando o blog. Tente novamente em alguns instantes.</p></div> : articles.length === 0 ? <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 p-10 text-center"><h2 className="text-xl font-bold text-gray-900 dark:text-white">Nenhum artigo publicado no momento</h2><p className="mt-3 text-gray-600 dark:text-slate-400">Volte em breve para acompanhar novos conteúdos.</p></div> : <BlogBrowser articles={articles} />}
        </div>
      </section>

      <section className="bg-red-600 px-4 py-20 md:px-8 lg:px-16">
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          <h2 className="text-4xl font-bold text-white md:text-5xl">Quer conversar sobre os conteúdos?</h2>
          <p className="text-lg text-red-100">Envie uma mensagem para tirar dúvidas, sugerir temas ou conhecer os projetos educacionais.</p>
          <Link href="/contato" className="inline-flex rounded-xl bg-white dark:bg-slate-900 px-6 py-3 font-semibold text-red-600 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-red-600">Fale com Anderson</Link>
        </div>
      </section>
    </div>
  );
}
