import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

export default function DashboardLibrary() {
  const materials = [
    {
      id: 1,
      title: "Phrasal Verbs Essentials",
      category: "Worksheets",
      level: "B1",
      downloads: 342,
    },
    {
      id: 2,
      title: "Presentation Skills",
      category: "Slides",
      level: "B2",
      downloads: 218,
    },
    {
      id: 3,
      title: "Pronunciation Guide",
      category: "Áudios",
      level: "A2",
      downloads: 567,
    },
    {
      id: 4,
      title: "Grammar Exercises",
      category: "Exercícios",
      level: "A1",
      downloads: 891,
    },
  ];

  return (
    <StudentDashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Minha Biblioteca</h1>
          <p className="text-muted-foreground mt-2">
            Acesse todos os materiais disponíveis para seus cursos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {materials.map((material) => (
            <Card key={material.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{material.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {material.category}
                    </p>
                  </div>
                  <Badge className="bg-primary text-white">
                    {material.level}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    {material.downloads} downloads
                  </span>
                </div>

                <Button className="w-full bg-primary hover:bg-primary-hover text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  Acessar Material
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </StudentDashboardLayout>
  );
}
