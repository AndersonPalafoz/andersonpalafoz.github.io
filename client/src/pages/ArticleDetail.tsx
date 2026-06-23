import { useRoute } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { GridSkeletonLoader } from "@/components/SkeletonLoader";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { useLocation } from "wouter";

export default function ArticleDetail() {
  const [, params] = useRoute("/blog/:slug");
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const slug = params?.slug as string;

  const { data: article, isLoading, error } = trpc.articles.bySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <GridSkeletonLoader count={1} />
            <div className="space-y-4">
              <GridSkeletonLoader count={3} />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Artigo não encontrado
            </h1>
            <p className="text-muted-foreground mb-6">
              Desculpe, o artigo que você está procurando não existe.
            </p>
            <Button onClick={() => navigate("/blog")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Blog
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = new Date(article.createdAt).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
            <button
              onClick={() => navigate("/blog")}
              className="hover:text-primary transition-colors"
            >
              Blog
            </button>
            <span>/</span>
            <span className="text-foreground">{article.title}</span>
          </div>

          {/* Header */}
          <article>
            <header className="mb-8">
              {/* Category Badge */}
              {article.category && (
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {article.category}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                {article.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 text-muted-foreground pb-8 border-b border-border">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
              <time dateTime={article.createdAt.toISOString()}>
                {formattedDate}
              </time>
                </div>

                {article.readingTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{article.readingTime} min de leitura</span>
                  </div>
                )}
              </div>
            </header>

            {/* Content */}
            <div className="prose prose-invert max-w-none mb-12">
              <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                {article.content}
              </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-border pt-8">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => navigate("/blog")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Blog
                </Button>

                <div className="text-sm text-muted-foreground">
                  Escrito por <span className="font-semibold text-foreground">Anderson Palafoz</span>
                </div>
              </div>
            </footer>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
