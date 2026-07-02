"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export default function CalendarioPage() {
  const eventos = [
    {
      id: 1,
      titulo: "Quiz: Present Simple",
      data: "2024-01-20",
      hora: "14:00",
      tipo: "avaliacao",
    },
    {
      id: 2,
      titulo: "Aula ao vivo: Conversation Practice",
      data: "2024-01-22",
      hora: "19:00",
      tipo: "aula",
    },
    {
      id: 3,
      titulo: "Entrega: Redação sobre viagens",
      data: "2024-01-25",
      hora: "23:59",
      tipo: "entrega",
    },
    {
      id: 4,
      titulo: "Prova Final: Module 1",
      data: "2024-02-01",
      hora: "10:00",
      tipo: "avaliacao",
    },
  ];

  const getTipoBadge = (tipo: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      avaliacao: { bg: "bg-red-500/10", text: "text-red-500" },
      aula: { bg: "bg-blue-500/10", text: "text-blue-500" },
      entrega: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
    };
    return badges[tipo] || badges.aula;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Calendário</h1>
        <p className="text-muted-foreground">
          Acompanhe datas importantes e eventos
        </p>
      </div>

      <div className="space-y-3">
        {eventos.map((evento) => {
          const badge = getTipoBadge(evento.tipo);
          return (
            <div
              key={evento.id}
              className="p-4 rounded-lg border border-border bg-card hover:bg-muted transition flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="text-primary" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {evento.titulo}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {evento.data} às {evento.hora}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
                >
                  {evento.tipo.charAt(0).toUpperCase() + evento.tipo.slice(1)}
                </span>
                <Button variant="outline" size="sm">
                  Ver
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
