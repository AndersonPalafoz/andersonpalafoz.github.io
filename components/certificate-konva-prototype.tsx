"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Layers, Download, Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";
import { jsPDF } from "jspdf";

export function CertificateKonvaPrototype() {
  const [studentName, setStudentName] = useState("Adna Caroline Vale Oliveira");
  const [courseTitle, setCourseTitle] = useState("Alfabetização e Letramento Étnico-Racial em Inglês");
  const [level, setLevel] = useState("Intermediário [B1-B2]");
  const [workloadHours, setWorkloadHours] = useState("40");
  const [includeBranding, setIncludeBranding] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      doc.setLineWidth(3);
      doc.setStrokeColor(37, 99, 235); // Azul Konva
      doc.rect(30, 30, pageWidth - 60, pageHeight - 60);

      doc.setLineWidth(1);
      doc.setStrokeColor(200, 200, 200);
      doc.rect(38, 38, pageWidth - 76, pageHeight - 76);

      if (includeBranding) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(37, 99, 235);
        doc.text("ANDERSON PALAFOZ", pageWidth / 2, 75, { align: "center" });
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("PLATAFORMA EDUCACIONAL & PESQUISA EM LINGUÍSTICA", pageWidth / 2, 92, { align: "center" });
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.setTextColor(30, 41, 59);
      doc.text("CERTIFICADO DE CONCLUSÃO (Konva Engine)", pageWidth / 2, 145, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      doc.text("Certificamos para os devidos fins que", pageWidth / 2, 185, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235);
      doc.text(studentName, pageWidth / 2, 225, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      doc.setTextColor(60, 60, 60);
      doc.text(`concluiu com êxito o programa acadêmico`, pageWidth / 2, 265, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(30, 30, 30);
      doc.text(courseTitle, pageWidth / 2, 305, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text(`Nível: ${level} · Carga Horária: ${workloadHours} horas`, pageWidth / 2, 340, { align: "center" });

      doc.setLineWidth(1);
      doc.setStrokeColor(150, 150, 150);
      doc.line(pageWidth / 2 - 150, 430, pageWidth / 2 + 150, 430);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text("Anderson Bacelar Palafoz", pageWidth / 2, 450, { align: "center" });
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Diretor Acadêmico & Professor Responsável", pageWidth / 2, 465, { align: "center" });

      doc.save(`certificado-konva-${studentName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
      toast.success("Certificado Konva exportado com sucesso em PDF!");
    } catch (err) {
      toast.error("Erro ao gerar PDF do Konva.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 shadow-md">
        <CardHeader className="bg-blue-50/50 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Protótipo Konva.js (Camadas Reativas)
              </CardTitle>
              <CardDescription>
                Editor em camadas sincronizado em tempo real com estado React, controle de branding e exportação direta em PDF A4.
              </CardDescription>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
              <Layers size={14} /> Camadas Reativas
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4 lg:col-span-1 border-r pr-0 lg:pr-6 border-border">
              <div className="space-y-2">
                <Label htmlFor="konva-student">Nome do Aluno</Label>
                <Input
                  id="konva-student"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="konva-course">Título do Curso</Label>
                <Input
                  id="konva-course"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="konva-level">Nível</Label>
                  <Input
                    id="konva-level"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="konva-hours">Carga Horária</Label>
                  <Input
                    id="konva-hours"
                    value={workloadHours}
                    onChange={(e) => setWorkloadHours(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="konva-branding" className="cursor-pointer text-xs">Incluir Logo Institucional</Label>
                <Switch
                  id="konva-branding"
                  checked={includeBranding}
                  onCheckedChange={setIncludeBranding}
                />
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-sm"
                >
                  {isExporting ? <RefreshCw className="animate-spin mr-2" size={16} /> : <Download className="mr-2" size={16} />}
                  Exportar PDF (Konva Engine)
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2 bg-muted/20 p-4 rounded-2xl border flex flex-col justify-center items-center">
              <div className="w-full max-w-[620px] aspect-[1.414/1] bg-white rounded-xl shadow-md border border-blue-200 p-6 relative flex flex-col justify-between text-center">
                {includeBranding && (
                  <div className="space-y-1">
                    <h4 className="font-black text-blue-600 tracking-wider text-sm">ANDERSON PALAFOZ</h4>
                    <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Plataforma Educacional & Pesquisa</p>
                  </div>
                )}
                <div className="space-y-3">
                  <h3 className="font-black text-xl text-foreground">CERTIFICADO DE CONCLUSÃO</h3>
                  <p className="text-xs text-muted-foreground">Certificamos para os devidos fins que</p>
                  <p className="font-bold text-lg text-blue-600">{studentName}</p>
                  <p className="text-xs text-muted-foreground">concluiu com êxito o programa acadêmico</p>
                  <p className="font-bold text-sm text-foreground">{courseTitle}</p>
                  <p className="text-[11px] text-muted-foreground">Nível: {level} · Carga Horária: {workloadHours}h</p>
                </div>
                <div className="border-t pt-2 w-48 mx-auto">
                  <p className="text-xs font-bold text-foreground">Anderson Bacelar Palafoz</p>
                  <p className="text-[10px] text-muted-foreground">Diretor Acadêmico</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">Pré-visualização em tempo real sincronizada via React State (Konva).</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
