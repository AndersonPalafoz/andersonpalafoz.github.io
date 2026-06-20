import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CEFR_LEVELS } from "@/constants";
import { Download, FileText, Zap } from "lucide-react";
import { useState } from "react";

export default function Materials() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ["Worksheets", "Slides", "Artigos", "Exercícios", "Áudios"];

  const materials = [
    {
      id: 1,
      title: "Phrasal Verbs Essentials",
      category: "Worksheets",
      level: "B1",
      description: "Guia completo dos phrasal verbs mais utilizados",
      downloads: 342,
    },
    {
      id: 2,
      title: "Presentation Skills",
      category: "Slides",
      level: "B2",
      description: "Técnicas para apresentações em inglês profissional",
      downloads: 218,
    },
    {
      id: 3,
      title: "Pronunciation Guide",
      category: "Áudios",
      level: "A2",
      description: "Guia de pronúncia com exemplos de áudio",
      downloads: 567,
    },
    {
      id: 4,
      title: "Grammar Exercises",
      category: "Exercícios",
      level: "A1",
      description: "Exercícios práticos de gramática básica",
      downloads: 891,
    },
    {
      id: 5,
      title: "Business English",
      category: "Artigos",
      level: "C1",
      description: "Vocabulário e expressões para contextos empresariais",
      downloads: 156,
    },
    {
      id: 6,
      title: "Conversation Practice",
      category: "Worksheets",
      level: "B1",
      description: "Diálogos e atividades de conversação",
      downloads: 423,
    },
    {
      id: 7,
      title: "Idioms and Expressions",
      category: "Slides",
      level: "C1",
      description: "Expressões idiomáticas e gírias do inglês moderno",
      downloads: 289,
    },
    {
      id: 8,
      title: "Vocabulary Builder",
      category: "Exercícios",
      level: "A2",
      description: "Atividades para expandir vocabulário temático",
      downloads: 634,
    },
    {
      id: 9,
      title: "CEFR Framework",
      category: "Artigos",
      level: "B2",
      description: "Entendendo os níveis CEFR e suas competências",
      downloads: 445,
    },
  ];

  const filteredMaterials = materials.filter((material) => {
    const levelMatch = !selectedLevel || material.level === selectedLevel;
    const categoryMatch = !selectedCategory || material.category === selectedCategory;
    return levelMatch && categoryMatch;
  });

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-light to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Biblioteca de Materiais
            </h1>
            <p className="text-lg text-muted-foreground">
              Acesso a worksheets, slides, artigos e recursos pedagógicos
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container">
          <div className="space-y-4">
            {/* Level Filter */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Nível CEFR</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedLevel === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLevel(null)}
                  className={selectedLevel === null ? "bg-primary text-white" : ""}
                >
                  Todos
                </Button>
                {CEFR_LEVELS.map((level) => (
                  <Button
                    key={level}
                    variant={selectedLevel === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLevel(level)}
                    className={
                      selectedLevel === level ? "bg-primary text-white" : ""
                    }
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Categoria</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className={selectedCategory === null ? "bg-primary text-white" : ""}
                >
                  Todas
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={
                      selectedCategory === category ? "bg-primary text-white" : ""
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Materials Grid */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          {filteredMaterials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <Card
                  key={material.id}
                  className="hover:shadow-lg transition-shadow flex flex-col"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{material.title}</CardTitle>
                        <CardDescription>{material.description}</CardDescription>
                      </div>
                      <Badge className="bg-primary text-white">
                        {material.level}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {material.category}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {material.downloads}
                      </span>
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary-hover text-white">
                      <Zap className="w-4 h-4 mr-2" />
                      Acessar Material
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">
                Nenhum material encontrado com os filtros selecionados
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Como Usar a Biblioteca
          </h2>

          <div className="space-y-4 text-muted-foreground">
            <p>
              Todos os materiais estão organizados por nível CEFR e categoria para facilitar sua busca. Você pode filtrar por nível de proficiência ou tipo de recurso.
            </p>

            <p>
              Os materiais são atualizados regularmente com novos conteúdos e recursos. Alunos registrados têm acesso completo à biblioteca.
            </p>

            <p>
              Para sugestões de novos materiais ou feedback, entre em contato através da página de contato.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
