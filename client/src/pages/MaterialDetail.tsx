import { useRoute } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { GridSkeletonLoader } from "@/components/SkeletonLoader";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Download, BookOpen } from "lucide-react";
import { useLocation } from "wouter";

const CEFR_LEVELS = {
  A1: "Iniciante",
  A2: "Elementar",
  B1: "Intermediário",
  B2: "Intermediário-Superior",
  C1: "Avançado",
  C2: "Proficiente",
};

const CATEGORY_COLORS: Record<string, string> = {
  Worksheets: "bg-blue-100 text-blue-800",
  Slides: "bg-purple-100 text-purple-800",
  Áudios: "bg-green-100 text-green-800",
  Exercícios: "bg-orange-100 text-orange-800",
  Artigos: "bg-pink-100 text-pink-800",
};

export default function MaterialDetail() {
  const [, params] = useRoute("/materiais/:id");
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const materialId = params?.id as string;

  // Simulando busca por ID (em produção, seria via tRPC)
  const { data: materials, isLoading } = trpc.materials.list.useQuery();
  const material = materials?.find((m) => m.id.toString() === materialId);

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

  if (!material) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Material não encontrado
            </h1>
            <p className="text-muted-foreground mb-6">
              Desculpe, o material que você está procurando não existe.
            </p>
            <Button onClick={() => navigate("/materiais")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar à Biblioteca
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryColor =
    CATEGORY_COLORS[material.category] ||
    "bg-gray-100 text-gray-800";
  const cefrLabel =
    CEFR_LEVELS[material.level as keyof typeof CEFR_LEVELS] ||
    material.level;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
            <button
              onClick={() => navigate("/materiais")}
              className="hover:text-primary transition-colors"
            >
              Biblioteca
            </button>
            <span>/</span>
            <span className="text-foreground">{material.title}</span>
          </div>

          {/* Header */}
          <article>
            <header className="mb-8">
              {/* Badges */}
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {material.level}
                </span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${categoryColor}`}
                >
                  {material.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                {material.title}
              </h1>

              {/* Description */}
              <p className="text-lg text-muted-foreground mb-8">
                {material.description}
              </p>

              {/* Stats */}
              <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Download className="w-4 h-4" />
                  <span>{material.downloads} downloads</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  <span>Nível {cefrLabel}</span>
                </div>
              </div>
            </header>

            {/* Content Preview */}
            <div className="mb-12 p-6 bg-muted rounded-lg">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Sobre este material
              </h2>
              <p className="text-foreground leading-relaxed">
                Este é um material educacional de alta qualidade, desenvolvido especificamente
                para alunos no nível {cefrLabel}. O conteúdo foi cuidadosamente estruturado
                para facilitar o aprendizado progressivo de inglês.
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90"
                onClick={() => {
                  // Simular download
                  alert(`Baixando: ${material.title}`);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Acessar Material
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/materiais")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar à Biblioteca
              </Button>
            </div>

            {/* Footer */}
            <footer className="border-t border-border pt-8">
              <div className="text-sm text-muted-foreground">
                <p>
                  Criado por{" "}
                  <span className="font-semibold text-foreground">
                    Anderson Palafoz
                  </span>
                </p>
                <p className="mt-2">
                  Parte da plataforma educacional Anderson Palafoz Platform
                </p>
              </div>
            </footer>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
