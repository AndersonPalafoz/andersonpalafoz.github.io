import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function DashboardActivities() {
  const activities = [
    {
      id: 1,
      title: "Quiz: Present Continuous",
      course: "English Basics",
      dueDate: "2024-06-25",
      status: "pending",
      progress: 0,
    },
    {
      id: 2,
      title: "Speaking Exercise: Introductions",
      course: "English Basics",
      dueDate: "2024-06-22",
      status: "completed",
      progress: 100,
    },
    {
      id: 3,
      title: "Writing Assignment: Daily Routine",
      course: "Elementary English",
      dueDate: "2024-06-28",
      status: "in_progress",
      progress: 60,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluído";
      case "in_progress":
        return "Em Progresso";
      default:
        return "Pendente";
    }
  };

  return (
    <StudentDashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Atividades</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe suas tarefas e exercícios
          </p>
        </div>

        <div className="space-y-4">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(activity.status)}
                      <h3 className="font-semibold text-foreground">
                        {activity.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {activity.course}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Vencimento: {new Date(activity.dueDate).toLocaleDateString("pt-BR")}</span>
                      <Badge variant="outline">
                        {getStatusLabel(activity.status)}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    {activity.status === "completed" ? "Visualizar" : "Fazer"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </StudentDashboardLayout>
  );
}
