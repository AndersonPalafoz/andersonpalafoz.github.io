
"use client";

import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

export default function BibliotecaPage() {
  const materiais = [
    {
      id: 1,
      titulo: "Grammar Guide: Present Simple",
      tipo: "PDF",
      tamanho: "2.4 MB",
      downloads: 156,
    },
    {
      id: 2,
      titulo: "Vocabulary List: Food & Drinks",
      tipo: "PDF",
      tamanho: "1.8 MB",
      downloads: 89,
    },
    {
      id: 3,
      titulo: "Phrasal Verbs Workbook",
      tipo: "PDF",
      tamanho: "3.2 MB",
      downloads: 234,
    },
    {
      id: 4,
      titulo: "Listening Comprehension Exercises",
      tipo: "ZIP",
      tamanho: "45.6 MB",
      downloads: 45,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Minha Biblioteca
        </h1>
        <p className="text-muted-foreground">
          Acesse seus materiais de estudo
        </p>
      </div>

      <div className="space-y-3">
        {materiais.map((material) => (
          <div
            key={material.id}
            className="p-4 rounded-lg border border-border bg-card hover:bg-muted transition flex items-center justify-between"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="text-primary" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  {material.titulo}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {material.tipo} • {material.tamanho}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <p className="text-muted-foreground">
                  {material.downloads} downloads
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download size={16} />
                Baixar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
