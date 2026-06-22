import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CEFR_LEVELS } from "@/constants";
import { Download, FileText } from "lucide-react";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

export default function Materials() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: materials, isLoading, error } = trpc.materials.list.useQuery();

  const categories = useMemo(() => {
    if (!materials) return [];
    return Array.from(new Set(materials.map(m => m.category))).filter(Boolean);
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    if (!materials) return [];
    return materials.filter(m => {
      const levelMatch = !selectedLevel || m.level === selectedLevel;
      const categoryMatch = !selectedCategory || m.category === selectedCategory;
      return levelMatch && categoryMatch;
    });
  }, [materials, selectedLevel, selectedCategory]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Biblioteca de Materiais</h1>
          <p className="text-muted-foreground mb-8">Recursos educacionais para todos os níveis CEFR</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-20 mb-2" />
                  <Skeleton className="h-8 w-full mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Biblioteca de Materiais</h1>
          <p className="text-red-500">Erro ao carregar materiais. Tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Biblioteca de Materiais</h1>
          <p className="text-muted-foreground">Recursos educacionais para todos os níveis CEFR (A1 a C2)</p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Level Filter */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Filtrar por Nível CEFR</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedLevel === null ? "default" : "outline"}
                onClick={() => setSelectedLevel(null)}
                size="sm"
              >
                Todos
              </Button>
              {CEFR_LEVELS.map((level) => (
                <Button
                  key={level}
                  variant={selectedLevel === level ? "default" : "outline"}
                  onClick={() => setSelectedLevel(level)}
                  size="sm"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-foreground">Filtrar por Categoria</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  onClick={() => setSelectedCategory(null)}
                  size="sm"
                >
                  Todas
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    size="sm"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {filteredMaterials.length} material{filteredMaterials.length !== 1 ? "is" : ""} encontrado{filteredMaterials.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Materials Grid */}
        {filteredMaterials.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum material encontrado com esses filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <Card key={material.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{material.level}</Badge>
                    <Badge variant="outline">{material.category}</Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{material.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {material.description || "Sem descrição"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Download className="w-4 h-4" />
                      <span>{material.downloads} downloads</span>
                    </div>
                    <Button className="w-full" variant="default">
                      Acessar Material
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
