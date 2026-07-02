"use client";

import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function CursosPage() {
  const cursos = [
    {
      id: 1,
      titulo: "English Basics - A1",
      descricao: "Fundamentos do inglês para iniciantes",
      progresso: 45,
      modulos: 8,
      modulosCompletos: 3,
    },
    {
      id: 2,
      titulo: "Elementary English - A2",
      descricao: "Consolidação de conhecimentos básicos",
      progresso: 20,
      modulos: 10,
      modulosCompletos: 2,
    },
    {
      id: 3,
      titulo: "Intermediate English - B1",
      descricao: "Desenvolvimento de conversação e escrita",
      progresso: 0,
      modulos: 12,
      modulosCompletos: 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Meus Cursos</h1>
        <p className="text-muted-foreground">
          Acompanhe seu progresso nos cursos de inglês
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cursos.map((curso) => (
          <div
            key={curso.id}
            className="p-6 rounded-lg border border-border bg-card hover:bg-muted transition space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="text-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{curso.titulo}</h3>
                  <p className="text-xs text-muted-foreground">
                    {curso.modulosCompletos}/{curso.modulos} módulos
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{curso.descricao}</p>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-semibold text-foreground">
                  {curso.progresso}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${curso.progresso}%` }}
                />
              </div>
            </div>

            <Button className="w-full">
              {curso.progresso > 0 ? "Continuar" : "Começar"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
