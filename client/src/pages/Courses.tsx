import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CEFR_LEVELS } from "@/constants";
import { BookOpen, Users, Clock } from "lucide-react";

export default function Courses() {
  const courses = [
    {
      id: 1,
      title: "English Basics",
      level: "A1",
      description: "Fundamentos essenciais do inglês para iniciantes completos",
      modules: 8,
      lessons: 32,
      duration: "8 semanas",
      students: 245,
      progress: 0,
    },
    {
      id: 2,
      title: "Elementary English",
      level: "A2",
      description: "Desenvolvimento de vocabulário e estruturas básicas",
      modules: 10,
      lessons: 40,
      duration: "10 semanas",
      students: 189,
      progress: 0,
    },
    {
      id: 3,
      title: "Intermediate Communication",
      level: "B1",
      description: "Fluência conversacional e compreensão de textos",
      modules: 12,
      lessons: 48,
      duration: "12 semanas",
      students: 156,
      progress: 0,
    },
    {
      id: 4,
      title: "Upper Intermediate",
      level: "B2",
      description: "Confiança em situações complexas e nuances da língua",
      modules: 12,
      lessons: 50,
      duration: "12 semanas",
      students: 98,
      progress: 0,
    },
    {
      id: 5,
      title: "Advanced English",
      level: "C1",
      description: "Domínio avançado e expressão sofisticada",
      modules: 10,
      lessons: 45,
      duration: "10 semanas",
      students: 67,
      progress: 0,
    },
    {
      id: 6,
      title: "Mastery English",
      level: "C2",
      description: "Proficiência máxima e especialização temática",
      modules: 8,
      lessons: 40,
      duration: "8 semanas",
      students: 42,
      progress: 0,
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-light to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Nossos Cursos
            </h1>
            <p className="text-lg text-muted-foreground">
              Cursos estruturados conforme o framework CEFR, do iniciante ao avançado
            </p>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription>{course.description}</CardDescription>
                    </div>
                    <Badge className="ml-2 bg-primary text-white">
                      {course.level}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  {/* Course Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {course.modules}
                      </div>
                      <p className="text-xs text-muted-foreground">Módulos</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {course.lessons}
                      </div>
                      <p className="text-xs text-muted-foreground">Aulas</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {course.students}
                      </div>
                      <p className="text-xs text-muted-foreground">Alunos</p>
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.lessons} aulas interativas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{course.students} alunos inscritos</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button className="w-full mt-4 bg-primary hover:bg-primary-hover text-white">
                    Explorar Curso
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CEFR Info Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container max-w-3xl">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Sobre o Framework CEFR
          </h2>

          <p className="text-muted-foreground mb-6 leading-relaxed">
            O CEFR (Common European Framework of Reference for Languages) é o padrão internacional para descrever proficiência em idiomas. Nossos cursos seguem rigorosamente este framework, garantindo que você progresse de forma estruturada e reconhecida globalmente.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CEFR_LEVELS.map((level) => (
              <div
                key={level}
                className="bg-background p-4 rounded-lg text-center border border-border"
              >
                <p className="font-bold text-lg text-primary">{level}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {level === "A1" && "Iniciante"}
                  {level === "A2" && "Elementar"}
                  {level === "B1" && "Intermediário"}
                  {level === "B2" && "Intermediário+"}
                  {level === "C1" && "Avançado"}
                  {level === "C2" && "Proficiência"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
