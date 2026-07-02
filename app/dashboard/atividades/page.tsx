"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function AtividadesPage() {
  const atividades = [
    {
      id: 1,
      titulo: "Quiz: Present Simple",
      curso: "English Basics - A1",
      tipo: "quiz",
      status: "completa",
      data: "2024-01-15",
      pontos: 85,
    },
    {
      id: 2,
      titulo: "Exercício: Vocabulário",
      curso: "English Basics - A1",
      tipo: "exercise",
      status: "pendente",
      dataVencimento: "2024-01-20",
    },
    {
      id: 3,
      titulo: "Tarefa: Redação",
      curso: "Elementary English - A2",
      tipo: "assignment",
      status: "em_progresso",
      dataVencimento: "2024-01-25",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completa":
        return <CheckCircle2 className="text-green-500" size={20} />;
      case "pendente":
        return <AlertCircle className="text-yellow-500" size={20} />;
      case "em_progresso":
        return <Clock className="text-blue-500" size={20} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completa":
        return "Completa";
      case "pendente":
        return "Pendente";
      case "em_progresso":
        return "Em Progresso";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Atividades</h1>
        <p className="text-muted-foreground">
          Acompanhe suas atividades e tarefas
        </p>
      </div>

      <div className="space-y-3">
        {atividades.map((atividade) => (
          <div
            key={atividade.id}
            className="p-4 rounded-lg border border-border bg-card hover:bg-muted transition flex items-center justify-between"
          >
            <div className="flex items-center gap-4 flex-1">
              <div>{getStatusIcon(atividade.status)}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  {atividade.titulo}
                </h3>
                <p className="text-sm text-muted-foreground">{atividade.curso}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {getStatusLabel(atividade.status)}
                </p>
                {atividade.status === "completa" && (
                  <p className="text-xs text-green-500">
                    {(atividade as any).pontos}%
                  </p>
                )}
                {atividade.status !== "completa" && (
                  <p className="text-xs text-muted-foreground">
                    Vence: {(atividade as any).dataVencimento}
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm">
                {atividade.status === "completa" ? "Ver" : "Fazer"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
