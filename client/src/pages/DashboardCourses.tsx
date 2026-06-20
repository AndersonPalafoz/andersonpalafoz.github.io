import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users } from "lucide-react";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

export default function DashboardCourses() {
  const { loading } = useProtectedRoute();

  if (loading) {
    return (
      <StudentDashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </StudentDashboardLayout>
    );
  }
  const enrolledCourses = [
    {
      id: 1,
      title: "English Basics",
      level: "A1",
      progress: 45,
      modules: 8,
      currentModule: 4,
      students: 245,
      nextLesson: "Lesson 12: Present Continuous",
    },
    {
      id: 2,
      title: "Elementary English",
      level: "A2",
      progress: 20,
      modules: 10,
      currentModule: 2,
      students: 189,
      nextLesson: "Lesson 5: Past Simple",
    },
  ];

  const availableCourses = [
    {
      id: 3,
      title: "Intermediate Communication",
      level: "B1",
      modules: 12,
      students: 156,
      description: "Fluência conversacional e compreensão de textos",
    },
    {
      id: 4,
      title: "Upper Intermediate",
      level: "B2",
      modules: 12,
      students: 98,
      description: "Confiança em situações complexas",
    },
  ];

  return (
    <StudentDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meus Cursos</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe seu progresso e continue aprendendo
          </p>
        </div>

        {/* Enrolled Courses */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Cursos em Andamento
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Módulo {course.currentModule} de {course.modules}
                      </p>
                    </div>
                    <Badge className="bg-primary text-white">
                      {course.level}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-semibold text-foreground">
                        {course.progress}%
                      </span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Course Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.modules} módulos</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{course.students} alunos</span>
                    </div>
                  </div>

                  {/* Next Lesson */}
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      Próxima aula
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {course.nextLesson}
                    </p>
                  </div>

                  {/* CTA */}
                  <Button className="w-full bg-primary hover:bg-primary-hover text-white">
                    Continuar Curso
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Available Courses */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Cursos Disponíveis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {course.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {course.modules} módulos
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course.students} alunos
                    </span>
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary-hover text-white">
                    Inscrever-se
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Cursos em Progresso", value: enrolledCourses.length },
            { label: "Horas Aprendidas", value: "24h 30m" },
            { label: "Certificados Obtidos", value: 0 },
          ].map((stat, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-sm mb-2">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </StudentDashboardLayout>
  );
}
