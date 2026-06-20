import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Download } from "lucide-react";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

export default function DashboardCertificates() {
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
  const certificates = [
    {
      id: 1,
      course: "English Basics",
      level: "A1",
      date: "2024-05-15",
      status: "completed",
    },
    {
      id: 2,
      course: "Elementary English",
      level: "A2",
      date: "2024-06-10",
      status: "completed",
    },
  ];

  const inProgress = [
    {
      id: 3,
      course: "Intermediate Communication",
      level: "B1",
      progress: 75,
    },
  ];

  return (
    <StudentDashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Certificados</h1>
          <p className="text-muted-foreground mt-2">
            Seus certificados de conclusão de cursos
          </p>
        </div>

        {/* Completed Certificates */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">
            Certificados Obtidos
          </h2>

          {certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <Card key={cert.id} className="border-green-200">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Award className="w-5 h-5 text-green-500" />
                          {cert.course}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Nível {cert.level}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Concluído
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Obtido em {new Date(cert.date).toLocaleDateString("pt-BR")}
                    </p>

                    <Button className="w-full bg-primary hover:bg-primary-hover text-white">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Certificado
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  Nenhum certificado obtido ainda
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* In Progress */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">
            Em Progresso
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inProgress.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{course.course}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Nível {course.level}
                      </p>
                    </div>
                    <Badge variant="outline">{course.progress}%</Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Continue estudando para obter seu certificado
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </StudentDashboardLayout>
  );
}
