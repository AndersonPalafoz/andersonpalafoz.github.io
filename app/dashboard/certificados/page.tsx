
"use client";

import { Button } from "@/components/ui/button";
import { Award, Download } from "lucide-react";

export default function CertificadosPage() {
  const certificados = [
    {
      id: 1,
      titulo: "English Basics - A1",
      data: "2024-01-15",
      nivel: "A1",
      numero: "CERT-2024-001",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Certificados
        </h1>
        <p className="text-muted-foreground">
          Seus certificados de conclusão de cursos
        </p>
      </div>

      {certificados.length > 0 ? (
        <div className="space-y-3">
          {certificados.map((cert) => (
            <div
              key={cert.id}
              className="p-6 rounded-lg border border-border bg-card hover:bg-muted transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Award className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">
                      {cert.titulo}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Concluído em {cert.data}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Nível</p>
                  <p className="font-semibold text-foreground">{cert.nivel}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Número do Certificado
                  </p>
                  <p className="font-semibold text-foreground">{cert.numero}</p>
                </div>
              </div>

              <button className="w-full gap-2">
                <Download size={16} />
                Baixar Certificado
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Award className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground mb-4">
            Você ainda não tem certificados
          </p>
          <Button>Começar um curso</Button>
        </div>
      )}
    </div>
  );
}
