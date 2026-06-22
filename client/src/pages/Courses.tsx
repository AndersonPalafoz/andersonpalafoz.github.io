import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CEFR_LEVELS } from "@/constants";
import { BookOpen, Users, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

export default function Courses() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const { data: courses, isLoading, error } = trpc.courses.list.useQuery();

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    if (!selectedLevel) return courses;
    return courses.filter(c => c.level === selectedLevel);
  }, [courses, selectedLevel]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Cursos Disponíveis</h1>
          <p className="text-muted-foreground mb-8">Aprenda inglês com cursos estruturados por nível CEFR</p>
          
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
          <h1 className="text-4xl font-bold mb-2 text-foreground">Cursos Disponíveis</h1>
          <p className="text-red-500">Erro ao carregar cursos. Tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Cursos Disponíveis</h1>
          <p className="text-muted-foreground">Aprenda inglês com cursos estruturados por nível CEFR (A1 a C2)</p>
        </div>

        {/* Level Filter */}
        <div className="mb-8">
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

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {filteredCourses.length} curso{filteredCourses.length !== 1 ? "s" : ""} encontrado{filteredCourses.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum curso encontrado com esse nível.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="default" className="bg-primary text-white">
                      {course.level}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description || "Sem descrição"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.modules || 0} módulos</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Duração variável</span>
                    </div>
                  </div>
                  <Button className="w-full" variant="default">
                    Explorar Curso
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
