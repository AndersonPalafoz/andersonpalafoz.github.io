import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

export default function DashboardCalendar() {
  const events = [
    {
      id: 1,
      title: "Aula: Present Continuous",
      course: "English Basics",
      date: "2024-06-21",
      time: "19:00",
      type: "class",
    },
    {
      id: 2,
      title: "Quiz: Past Simple",
      course: "Elementary English",
      date: "2024-06-22",
      time: "20:00",
      type: "quiz",
    },
    {
      id: 3,
      title: "Entrega: Speaking Exercise",
      course: "English Basics",
      date: "2024-06-25",
      time: "23:59",
      type: "deadline",
    },
    {
      id: 4,
      title: "Live Session: Conversation",
      course: "Intermediate Communication",
      date: "2024-06-28",
      time: "18:00",
      type: "live",
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "class":
        return "bg-blue-100 text-blue-800";
      case "quiz":
        return "bg-purple-100 text-purple-800";
      case "deadline":
        return "bg-red-100 text-red-800";
      case "live":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "class":
        return "Aula";
      case "quiz":
        return "Quiz";
      case "deadline":
        return "Prazo";
      case "live":
        return "Live";
      default:
        return "Evento";
    }
  };

  return (
    <StudentDashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendário</h1>
          <p className="text-muted-foreground mt-2">
            Próximos eventos e prazos importantes
          </p>
        </div>

        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground">
                        {event.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {event.course}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(event.date).toLocaleDateString("pt-BR")}
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.time}
                      </span>
                      <Badge className={getTypeColor(event.type)}>
                        {getTypeLabel(event.type)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </StudentDashboardLayout>
  );
}
